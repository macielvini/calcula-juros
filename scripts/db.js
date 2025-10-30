const DB_NAME = 'calc-db';
const DB_VERSION = 1;
const STORE = 'calculations';

export function openDatabase() {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, DB_VERSION);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(STORE)) {
				const store = db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
				store.createIndex('by_createdAt', 'createdAt');
			}
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

export async function addCalculation(entry) {
	const db = await openDatabase();
	await txPut(db, { ...entry, createdAt: Date.now() });
	await enforceCap(db, 30);
}

function txPut(db, value) {
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, 'readwrite');
		tx.objectStore(STORE).put(value);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

export async function getAllCalculationsDesc() {
	const db = await openDatabase();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, 'readonly');
		const store = tx.objectStore(STORE);
		const idx = store.index('by_createdAt');
		const items = [];
		idx.openCursor(null, 'prev').onsuccess = (e) => {
			const cursor = e.target.result;
			if (cursor) { items.push(cursor.value); cursor.continue(); } else resolve(items);
		};
		tx.onerror = () => reject(tx.error);
	});
}

export async function deleteById(id) {
	const db = await openDatabase();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, 'readwrite');
		tx.objectStore(STORE).delete(id);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

export async function clearAll() {
	const db = await openDatabase();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, 'readwrite');
		tx.objectStore(STORE).clear();
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

async function enforceCap(db, cap) {
	const tx = db.transaction(STORE, 'readwrite');
	const idx = tx.objectStore(STORE).index('by_createdAt');
	const keys = [];
	idx.openCursor(null, 'prev').onsuccess = (e) => {
		const cursor = e.target.result;
		if (!cursor) return;
		keys.push(cursor.primaryKey);
		cursor.continue();
	};
	return new Promise((resolve, reject) => {
		tx.oncomplete = async () => {
			if (keys.length <= cap) return resolve();
			const toDelete = keys.slice(cap);
			const tx2 = db.transaction(STORE, 'readwrite');
			const store = tx2.objectStore(STORE);
			toDelete.forEach((k) => store.delete(k));
			tx2.oncomplete = () => resolve();
			tx2.onerror = () => reject(tx2.error);
		};
		tx.onerror = () => reject(tx.error);
	});
}


