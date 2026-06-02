import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createGalleryItem, subscribeGallery } from '../services/firestore';
import { uploadToCloudinary } from '../utils/cloudinary';
import { useAuth } from '../hooks/useAuth';
import EmptyState from '../components/EmptyState';
import UploadField from '../components/UploadField';
import { roleConfig } from '../config/env';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState('');
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { user, isAdmin } = useAuth();

  // debug: log expected admin emails to help diagnose visibility issues
  console.debug('roleConfig.adminEmails:', roleConfig.adminEmails, 'current user:', user?.email);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeGallery((items) => {
      setImages(items);
      setLoading(false);
    }, user ? undefined : 4);

    return unsubscribe;
  }, [user]);

  const handleUpload = async (event) => {
    const input = event.currentTarget || event.target;
    const file = input.files?.[0];
    if (!file) return;

    setUploading(true);
    setPreview(URL.createObjectURL(file));
    setError('');
    try {
      const upload = await uploadToCloudinary(file);
      await createGalleryItem({
        imageUrl: upload.secureUrl,
        title: title.trim() || file.name.replace(/\.[^/.]+$/, ''),
      });
      setTitle('');
      setPreview('');
    } catch (err) {
      console.error('Gallery upload failed', err);
      setError('Upload failed. Check console for details.');
    } finally {
      setUploading(false);
      input.value = '';
    }
  };

  return (
    <main className="section">
      <motion.div className="section-heading" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <span className="eyebrow">A visual keepsake</span>
        <h1>Gallery</h1>
        <p>{user ? 'A living collection of favorite photos, curated with a gentle glow.' : 'A small preview of the celebration. Login opens the full journey.'}</p>
      </motion.div>

      {isAdmin ? (
        <div className="card admin-upload-panel">
          <input className="input" placeholder="Image title" value={title} onChange={(event) => setTitle(event.target.value)} />
          <UploadField label="Upload gallery image" onChange={handleUpload} uploading={uploading} preview={preview} />
          {error && <div className="form-error">{error}</div>}
        </div>
      ) : (
        <div className="card quiet-card">
          <span className="card-kicker">Admin upload</span>
          <p>{user ? `Signed in as ${user.email}. Admin access required to upload.` : 'Login to see the full gallery upload controls.'}</p>
          <p className="muted">Configured admin emails: {roleConfig.adminEmails.join(', ') || 'none'}</p>
        </div>
      )}

      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : images.length ? (
        <div className="gallery-grid">
          {images.map((image, index) => (
            <motion.article
              key={image.id}
              className="gallery-item"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <img src={image.imageUrl} alt={image.title} loading="lazy" />
              <div><span>{image.title}</span></div>
            </motion.article>
          ))}
        </div>
      ) : (
        <EmptyState title="No gallery images yet" message="Admins can upload the first memory from the dashboard or this page." />
      )}
    </main>
  );
};

export default Gallery;
