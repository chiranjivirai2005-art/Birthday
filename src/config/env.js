const env = import.meta.env;

const placeholderValues = new Set([
  'your_api_key',
  'your_project.firebaseapp.com',
  'your_project_id',
  'your_project.appspot.com',
  'your_sender_id',
  'your_app_id',
  'admin1@example.com',
  'admin2@example.com',
  'special@example.com',
]);

const isPlaceholder = (value) => placeholderValues.has((value || '').toLowerCase());
const cleanValue = (value) => (isPlaceholder(value) ? '' : value || '');

export const firebaseConfigValues = {
  apiKey: cleanValue(env.REACT_APP_FIREBASE_API_KEY),
  authDomain: cleanValue(env.REACT_APP_FIREBASE_AUTH_DOMAIN),
  projectId: cleanValue(env.REACT_APP_FIREBASE_PROJECT_ID),
  storageBucket: cleanValue(env.REACT_APP_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanValue(env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanValue(env.REACT_APP_FIREBASE_APP_ID),
};

export const cloudinaryConfig = {
  cloudName: env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'df19ltqsg',
  uploadPreset: env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'birthday',
};

export const roleConfig = {
  adminEmails: [
    cleanValue(env.REACT_APP_ADMIN_EMAIL_1),
    cleanValue(env.REACT_APP_ADMIN_EMAIL_2),
  ].filter(Boolean).map((email) => email.toLowerCase()),
  specialEmail: cleanValue(env.REACT_APP_SPECIAL_EMAIL).toLowerCase(),
};

export const birthdayDate = cleanValue(env.REACT_APP_BIRTHDAY_DATE) || '2026-06-03';

export const isConfigured = Object.values(firebaseConfigValues).every(Boolean);
export const hasPlaceholderConfig = Object.values(firebaseConfigValues).some((value) => isPlaceholder(value));
export const isFirebaseReady = isConfigured && !hasPlaceholderConfig;
