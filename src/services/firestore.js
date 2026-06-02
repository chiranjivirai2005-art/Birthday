import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const buildOrderConstraints = (orderFields) => orderFields.map(({ field, direction }) => orderBy(field, direction));

const listCollection = async (collectionName, orderFields = [{ field: 'createdAt', direction: 'desc' }], maxItems) => {
  const constraints = buildOrderConstraints(orderFields);
  if (maxItems) constraints.push(limit(maxItems));
  const snapshot = await getDocs(query(collection(db, collectionName), ...constraints));
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));
};

const subscribeCollection = (collectionName, orderFields = [{ field: 'createdAt', direction: 'desc' }], callback, maxItems) => {
  const constraints = buildOrderConstraints(orderFields);
  if (maxItems) constraints.push(limit(maxItems));

  return onSnapshot(
    query(collection(db, collectionName), ...constraints),
    (snapshot) => {
      callback(snapshot.docs.map((document) => ({ id: document.id, ...document.data() })));
    },
    (error) => {
      console.error('Firestore subscription error:', error);
      callback([]);
    }
  );
};

const sortWishes = (items) => items.sort((a, b) => {
  const pinnedA = Boolean(a.pinned);
  const pinnedB = Boolean(b.pinned);
  if (pinnedA !== pinnedB) return pinnedB - pinnedA;

  const createdA = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.parse(a.createdAt || '') || 0;
  const createdB = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.parse(b.createdAt || '') || 0;
  return createdB - createdA;
});

export const listWishes = async () => sortWishes(await listCollection('wishes', [{ field: 'createdAt', direction: 'desc' }]));
export const listGallery = (maxItems) => listCollection('gallery', [{ field: 'uploadedAt', direction: 'desc' }], maxItems);
export const listPrivateMoments = () => listCollection('privateMoments', [{ field: 'createdAt', direction: 'desc' }]);
export const listSpecialDays = () => listCollection('specialDays', [{ field: 'date', direction: 'asc' }]);

export const subscribeWishes = (callback, maxItems) => subscribeCollection('wishes', [{ field: 'createdAt', direction: 'desc' }], (items) => callback(sortWishes(items)), maxItems);
export const subscribeGallery = (callback, maxItems) => subscribeCollection('gallery', [{ field: 'uploadedAt', direction: 'desc' }], callback, maxItems);
export const subscribePrivateMoments = (callback) => subscribeCollection('privateMoments', [{ field: 'createdAt', direction: 'desc' }], callback);
export const subscribeSpecialDays = (callback) => subscribeCollection('specialDays', [{ field: 'date', direction: 'asc' }], callback);

export const createWish = (data) => addDoc(collection(db, 'wishes'), {
  ...data,
  mood: data.mood || '',
  voiceUrl: data.voiceUrl || '',
  pinned: false,
  createdAt: serverTimestamp(),
});

export const createGalleryItem = (data) => addDoc(collection(db, 'gallery'), {
  ...data,
  uploadedAt: serverTimestamp(),
});

export const createPrivateMoment = (data) => addDoc(collection(db, 'privateMoments'), {
  ...data,
  createdAt: serverTimestamp(),
});

export const createSpecialDay = (data) => addDoc(collection(db, 'specialDays'), {
  ...data,
  createdAt: serverTimestamp(),
});

export const updateItem = (collectionName, id, data) => updateDoc(doc(db, collectionName, id), data);
export const deleteItem = (collectionName, id) => deleteDoc(doc(db, collectionName, id));
