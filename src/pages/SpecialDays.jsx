import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import SpecialDayCard from '../components/SpecialDayCard';
import UploadField from '../components/UploadField';
import { createSpecialDay, subscribeSpecialDays } from '../services/firestore';
import { uploadToCloudinary } from '../utils/cloudinary';
import { useAuth } from '../hooks/useAuth';

const emptyForm = { title: '', description: '', date: '', imageUrl: '' };

const SpecialDays = () => {
  const [days, setDays] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { user, isAdmin, isSpecial, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) {
      return undefined;
    }

    if (!user || (!isAdmin && !isSpecial)) {
      setDays([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const unsubscribe = subscribeSpecialDays((items) => {
      setDays(items);
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
    await createSpecialDay({
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
        <span className="eyebrow">Milestones that matter</span>
        <h1>Special Days</h1>
        <p>A graceful timeline for firsts, favorites, and the dates that changed everything.</p>
      </motion.div>

      {isAdmin && (
        <form className="card editor-form" onSubmit={handleSubmit}>
          <input className="input" placeholder="Day title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          <input className="input" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
          <textarea className="textarea" placeholder="Why this day matters" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
          <UploadField label="Optional image" onChange={handleUpload} uploading={uploading} preview={form.imageUrl} />
          <button className="btn" type="submit">Add Special Day</button>
        </form>
      )}

      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : days.length ? (
        <div className="timeline">
          {days.map((day) => <SpecialDayCard key={day.id} day={day} />)}
        </div>
      ) : (
        <EmptyState title="No special days yet" message="Admins can add a meaningful date to begin the timeline." />
      )}
    </main>
  );
};

export default SpecialDays;
