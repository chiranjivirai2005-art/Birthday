# Birthday Keepsake

A premium, birthday website built with React JSX, React Router, Firebase Authentication, Firestore, Cloudinary uploads, responsive CSS, and Framer Motion.

## Features

- Public wish submission page
- Public gallery preview limited to 4 images
- Firebase Email/Password login only
- Admin-only dashboard for content management
- Special-person experience with warmer motion and floating hearts
- Firestore-backed wishes, gallery, and special days
- Cloudinary image uploads with previews and upload progress UI
- Responsive glassmorphism interface with soft birthday decorations
- Production build chunk splitting for React, Firebase, and Framer Motion

## Environment Variables

Create `.env` in the project root:

```env
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=

REACT_APP_CLOUDINARY_CLOUD_NAME=
REACT_APP_CLOUDINARY_UPLOAD_PRESET=

REACT_APP_ADMIN_EMAIL_1=
REACT_APP_ADMIN_EMAIL_2=
REACT_APP_SPECIAL_EMAIL=
```

Firebase users must already exist in Firebase Authentication. There is intentionally no signup or account creation page.

## Firestore Collections

- `wishes`: `name`, `message`, `createdAt`
- `gallery`: `imageUrl`, `title`, `uploadedAt`
- `privateMoments`: `title`, `description`, `imageUrl`, `date`, `createdAt`
- `specialDays`: `title`, `description`, `date`, `imageUrl`, `createdAt`

## Commands

```bash
npm install
npm run dev
npm run build
```

## Structure

```text
src/
  components/
  config/
  firebase/
  hooks/
  pages/
  services/
  utils/
```

## Notes

- Vite is configured to expose both `VITE_` and requested `REACT_APP_` environment variable prefixes.
- Admin access is controlled by `REACT_APP_ADMIN_EMAIL_1` and `REACT_APP_ADMIN_EMAIL_2`.
- The special-person experience is controlled by `REACT_APP_SPECIAL_EMAIL`.
- Cloudinary uploads use the unsigned preset configured in `REACT_APP_CLOUDINARY_UPLOAD_PRESET`.
