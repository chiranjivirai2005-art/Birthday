import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import MemoryCard from '../components/MemoryCard';
import EmptyState from '../components/EmptyState';
import UploadField from '../components/UploadField';
import { createPrivateMoment, subscribePrivateMoments } from '../services/firestore';
import { uploadToCloudinary } from '../utils/cloudinary';
import { useAuth } from '../hooks/useAuth';

const emptyForm = { title: '', description: '', date: '', imageUrl: '' };

const PrivateMoments = () => {
  const [moments, setMoments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { user, isAdmin, isSpecial, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) {
      return undefined;
    }

    if (!user || (!isAdmin && !isSpecial)) {
      setMoments([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const unsubscribe = subscribePrivateMoments((items) => {
      setMoments(items);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, isAdmin, isSpecial, authLoading]);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const upload = await uploadToCloudinary(file);
      setForm((current) => ({ ...current, imageUrl: upload.secureUrl }));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await createPrivateMoment({
      title: form.title.trim(),
      description: form.description.trim(),
      date: form.date,
      imageUrl: form.imageUrl,
    });
    setForm(emptyForm);
  };

  if (authLoading) {
    return (
      <main className="section loading-state">
        <div className="spinner" />
      </main>
    );
  }

  if (!user || (!isAdmin && !isSpecial)) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className={`section ${isSpecial ? 'special-section' : ''}`}>
      <motion.div className="section-heading" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <span className="eyebrow">For the closest memories</span>
        <h1>Private Moments</h1>
        <p>Photos, dates, and words arranged as an intimate memory wall.</p>
      </motion.div>

      {isAdmin && (
        <form className="card editor-form" onSubmit={handleSubmit}>
          <input className="input" placeholder="Memory title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          <input className="input" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
          <textarea className="textarea" placeholder="Describe the moment" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
          <UploadField label="Upload memory photo" onChange={handleUpload} uploading={uploading} preview={form.imageUrl} />
          <button className="btn" type="submit">Add Memory</button>
        </form>
      )}

      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : moments.length ? (
        <div className="grid grid-3">
          {moments.map((moment) => <MemoryCard key={moment.id} memory={moment} />)}
        </div>
      ) : (
        <EmptyState title="No private moments yet" message="Admins can begin this intimate collection with a first memory." />
      )}
    </main>
  );
};

export default PrivateMoments;
