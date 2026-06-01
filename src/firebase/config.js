import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfigValues } from '../config/env';

const app = initializeApp(firebaseConfigValues);
export const auth = getAuth(app);
export const db = getFirestore(app);
