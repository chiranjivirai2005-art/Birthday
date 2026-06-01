import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import UploadField from '../components/UploadField';
import {
  createGalleryItem,
  createPrivateMoment,
  createSpecialDay,
  deleteItem,
  listGallery,
  listPrivateMoments,
  listSpecialDays,
  listWishes,
  updateItem,
} from '../services/firestore';
import { uploadToCloudinary } from '../utils/cloudinary';
import { formatDate } from '../utils/date';

const emptyContent = { title: '', description: '', date: '', imageUrl: '' };

const AdminDashboard = () => {
  const [data, setData] = useState({ wishes: [], gallery: [], privateMoments: [], specialDays: [] });
  const [active, setActive] = useState('gallery');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [momentForm, setMomentForm] = useState(emptyContent);
  const [dayForm, setDayForm] = useState(emptyContent);
  const [editing, setEditing] = useState(null);
  const { user, isAdmin, loading: authLoading } = useAuth();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [wishes, gallery, privateMoments, specialDays] = await Promise.all([
        listWishes(),
        listGallery(),
        listPrivateMoments(),
        listSpecialDays(),
      ]);
      setData({ wishes, gallery, privateMoments, specialDays });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user || !isAdmin) {
      return undefined;
    }

    fetchAll();
  }, [user, isAdmin, authLoading]);

  const uploadImage = async (event, setter) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const upload = await uploadToCloudinary(file);
      await setter(upload.secureUrl, file.name.replace(/\.[^/.]+$/, ''));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const addGallery = async (event) => {
    await uploadImage(event, async (imageUrl, fileTitle) => {
      await createGalleryItem({ imageUrl, title: galleryTitle.trim() || fileTitle });
      setGalleryTitle('');
      await fetchAll();
    });
  };

  const addMoment = async (event) => {
    event.preventDefault();
    await createPrivateMoment({
      title: momentForm.title.trim(),
      description: momentForm.description.trim(),
      date: momentForm.date,
      imageUrl: momentForm.imageUrl,
    });
    setMomentForm(emptyContent);
    await fetchAll();
  };

  const addDay = async (event) => {
    event.preventDefault();
    await createSpecialDay({
      title: dayForm.title.trim(),
      description: dayForm.description.trim(),
      date: dayForm.date,
      imageUrl: dayForm.imageUrl,
    });
    setDayForm(emptyContent);
    await fetchAll();
  };

  const handleDelete = async (collectionName, id) => {
    await deleteItem(collectionName, id);
    await fetchAll();
  };

  const handleSave = async (event) => {
    event.preventDefault();
    await updateItem(editing.collectionName, editing.id, editing.values);
    setEditing(null);
    await fetchAll();
  };

  const startEdit = (collectionName, item) => {
    setEditing({
      collectionName,
      id: item.id,
      values: {
        title: item.title || '',
        description: item.description || '',
        date: item.date || '',
        imageUrl: item.imageUrl || '',
      },
    });
  };

  if (authLoading) {
    return (
      <main className="section loading-state">
        <div className="spinner" />
      </main>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="section dashboard">
      <motion.div className="section-heading" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <span className="eyebrow">Admin studio</span>
        <h1>Dashboard</h1>
        <p>Upload, refine, replace, and remove the content that shapes the birthday journey.</p>
      </motion.div>

      <div className="dashboard-tabs">
        {[
          ['gallery', `Gallery ${data.gallery.length}`],
          ['moments', `Private Moments ${data.privateMoments.length}`],
          ['days', `Special Days ${data.specialDays.length}`],
          ['wishes', `Wishes ${data.wishes.length}`],
        ].map(([key, label]) => (
          <button key={key} className={active === key ? 'active' : ''} onClick={() => setActive(key)}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : (
        <>
          {active === 'gallery' && (
            <section className="dashboard-panel">
              <div className="card admin-upload-panel">
                <input className="input" placeholder="Gallery image title" value={galleryTitle} onChange={(event) => setGalleryTitle(event.target.value)} />
                <UploadField label="Upload gallery image" onChange={addGallery} uploading={uploading} />
              </div>
              <div className="admin-list image-admin-list">
                {data.gallery.map((item) => (
                  <article className="admin-row" key={item.id}>
                    <img src={item.imageUrl} alt={item.title} loading="lazy" />
                    <div><strong>{item.title}</strong><span>{formatDate(item.uploadedAt)}</span></div>
                    <button onClick={() => startEdit('gallery', item)}>Edit</button>
                    <button className="danger" onClick={() => handleDelete('gallery', item.id)}>Delete</button>
                  </article>
                ))}
              </div>
            </section>
          )}

          {active === 'moments' && (
            <section className="dashboard-panel">
              <ContentForm form={momentForm} setForm={setMomentForm} onSubmit={addMoment} onUpload={(event) => uploadImage(event, (url) => setMomentForm((current) => ({ ...current, imageUrl: url })))} uploading={uploading} button="Add Memory" />
              <ContentList items={data.privateMoments} collectionName="privateMoments" onEdit={startEdit} onDelete={handleDelete} />
            </section>
          )}

          {active === 'days' && (
            <section className="dashboard-panel">
              <ContentForm form={dayForm} setForm={setDayForm} onSubmit={addDay} onUpload={(event) => uploadImage(event, (url) => setDayForm((current) => ({ ...current, imageUrl: url })))} uploading={uploading} button="Add Special Day" />
              <ContentList items={data.specialDays} collectionName="specialDays" onEdit={startEdit} onDelete={handleDelete} />
            </section>
          )}

          {active === 'wishes' && (
            <section className="admin-list">
              {data.wishes.map((wish) => (
                <article className="admin-row" key={wish.id}>
                  <div><strong>{wish.name}</strong><p>{wish.message}</p></div>
                  <button className="danger" onClick={() => handleDelete('wishes', wish.id)}>Delete</button>
                </article>
              ))}
            </section>
          )}
        </>
      )}

      {editing && (
        <div className="modal-backdrop">
          <form className="card edit-modal" onSubmit={handleSave}>
            <h2>Edit Content</h2>
            <input className="input" placeholder="Title" value={editing.values.title} onChange={(event) => setEditing({ ...editing, values: { ...editing.values, title: event.target.value } })} />
            {editing.collectionName !== 'gallery' && (
              <>
                <input className="input" type="date" value={editing.values.date} onChange={(event) => setEditing({ ...editing, values: { ...editing.values, date: event.target.value } })} />
                <textarea className="textarea" placeholder="Description" value={editing.values.description} onChange={(event) => setEditing({ ...editing, values: { ...editing.values, description: event.target.value } })} />
              </>
            )}
            <UploadField label="Replace image" uploading={uploading} preview={editing.values.imageUrl} onChange={(event) => uploadImage(event, (url) => setEditing((current) => ({ ...current, values: { ...current.values, imageUrl: url } })))} />
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="btn">Save Changes</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
};

const ContentForm = ({ form, setForm, onSubmit, onUpload, uploading, button }) => (
  <form className="card editor-form" onSubmit={onSubmit}>
    <input className="input" placeholder="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
    <input className="input" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
    <textarea className="textarea" placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
    <UploadField label="Upload image" onChange={onUpload} uploading={uploading} preview={form.imageUrl} />
    <button className="btn" type="submit">{button}</button>
  </form>
);

const ContentList = ({ items, collectionName, onEdit, onDelete }) => (
  <div className="admin-list">
    {items.map((item) => (
      <article className="admin-row" key={item.id}>
        {item.imageUrl && <img src={item.imageUrl} alt={item.title} loading="lazy" />}
        <div><strong>{item.title}</strong><span>{formatDate(item.date)}</span><p>{item.description}</p></div>
        <button onClick={() => onEdit(collectionName, item)}>Edit</button>
        <button className="danger" onClick={() => onDelete(collectionName, item.id)}>Delete</button>
      </article>
    ))}
  </div>
);

export default AdminDashboard;
