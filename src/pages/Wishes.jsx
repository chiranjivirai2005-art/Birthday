import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import WishCard from '../components/WishCard';
import EmptyState from '../components/EmptyState';
import UploadField from '../components/UploadField';
import { createWish, subscribeWishes } from '../services/firestore';
import { useAuth } from '../hooks/useAuth';
import { uploadToCloudinary } from '../utils/cloudinary';
import { downloadWishStatus } from '../utils/wishDownload';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';

const moodOptions = ['Emotional', 'Funny', 'Blessing', 'Memory', 'Cute'];

const Wishes = () => {
  const { user, isSpecial, loading: authLoading } = useAuth();
  const [wishes, setWishes] = useState([]);
  const [form, setForm] = useState({ name: '', message: '', mood: '' });
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [wishReceipt, setWishReceipt] = useState(null);
  const [celebrating, setCelebrating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { recording, audioUrl, duration, error: recordError, startRecording, stopRecording, clearRecording, uploadRecording } = useVoiceRecorder();

  useEffect(() => {
    if (authLoading) {
      return undefined;
    }

    if (!user) {
      setWishes([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const unsubscribe = subscribeWishes((items) => {
      setWishes(items);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, authLoading]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('lastWishReceipt');
      if (saved) {
        setWishReceipt(JSON.parse(saved));
      }
    } catch {
      // ignore storage failures
    }
  }, []);

  const handlePictureUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const upload = await uploadToCloudinary(file);
      setForm((current) => ({ ...current, imageUrl: upload.secureUrl }));
      setImagePreview(upload.secureUrl);
    } catch {
      setError('Picture upload failed. Please try again.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const getWishDraft = () => ({
    name: form.name.trim(),
    message: form.message.trim(),
    mood: form.mood,
    imageUrl: form.imageUrl || '',
    voiceUrl: audioUrl || '',
  });

  const showDownloadHint = () => {
    window.alert('Your landscape wish card is ready. Use the downloaded image for your status/story wishing.');
  };

  const generateDownload = async (wishDraft) => {
    setGenerating(true);
    try {
      await downloadWishStatus(wishDraft, { heading: 'Happy Birthday Stuti' });
      showDownloadHint();
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateOnly = async () => {
    if (!form.name.trim() || !form.message.trim() || uploading) return;
    setError('');
    await generateDownload(getWishDraft());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.message.trim() || uploading) return;
    setSubmitting(true);
    setSuccess(false);
    setError('');
    setShowPreview(false);

    try {
      const voiceUrl = audioUrl ? await uploadRecording() : '';
      const wishDraft = {
        name: form.name.trim(),
        message: form.message.trim(),
        mood: form.mood,
        imageUrl: form.imageUrl || '',
        voiceUrl,
      };
      await createWish(wishDraft);
      await generateDownload(wishDraft);
      setForm({ name: '', message: '', mood: '' });
      setImagePreview('');
      setSuccess(true);
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 4200);

      const receipt = {
        name: wishDraft.name,
        mood: wishDraft.mood,
        message: wishDraft.message,
        voiceSeconds: duration,
        sentAt: new Date().toISOString(),
      };
      setWishReceipt(receipt);
      try {
        window.localStorage.setItem('lastWishReceipt', JSON.stringify(receipt));
      } catch {
        // ignore storage failures
      }
      clearRecording();
    } catch {
      setError('Your wish could not be added. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="section wishes-page">
      <div className="wishes-background" aria-hidden="true">
        <span className="wish-bg-balloon wish-bg-balloon-one" />
        <span className="wish-bg-balloon wish-bg-balloon-two" />
        <span className="wish-bg-balloon wish-bg-balloon-three" />
        <span className="wish-bg-cake wish-bg-cake-one" />
        <span className="wish-bg-cake wish-bg-cake-two" />
      </div>
      <motion.div className="section-heading" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <span className="eyebrow">💌 Collected with care</span>
        <h1>{isSpecial ? 'Your Birthday Wish Boxes 🎁' : 'Birthday Wishes 🎉'}</h1>
        <p>{user ? 'Every wish is wrapped into a little keepsake box, ready for the birthday heart to open again and again.' : 'Leave a message that feels like a small keepsake: sincere, warm, and beautifully preserved.'}</p>
      </motion.div>

      {!user && (
        <motion.form className="card wish-form" onSubmit={handleSubmit} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="form-grid">
            <div className="mood-list" aria-label="Choose a mood">
              {moodOptions.map((mood) => (
                <button
                  key={mood}
                  type="button"
                  className={`mood-button ${form.mood === mood ? 'mood-button-active' : ''}`}
                  onClick={() => setForm({ ...form, mood })}
                >
                  {mood}
                </button>
              ))}
            </div>
            <input className="input" placeholder="Your name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} maxLength={80} required />
            <textarea className="textarea" placeholder="Write your birthday wish..." value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} maxLength={600} required />
            <UploadField label="Add a picture for the wish/status card" onChange={handlePictureUpload} uploading={uploading} preview={imagePreview} />
          </div>
          <div className="voice-recorder">
            <span>{recording ? `Recording... ${duration}s` : 'Record a voice wish'}</span>
            <div className="voice-controls">
              {!recording ? (
                <button className="btn btn-secondary btn-small" type="button" onClick={startRecording}>Start recording</button>
              ) : (
                <button className="btn btn-secondary btn-small" type="button" onClick={stopRecording}>Stop recording</button>
              )}
              {audioUrl && (
                <button className="btn btn-secondary btn-small" type="button" onClick={clearRecording}>Clear audio</button>
              )}
            </div>
            {recordError && <span className="form-error">{recordError}</span>}
          </div>
          {audioUrl && (
            <div className="wish-preview-audio">
              <audio controls src={audioUrl} preload="none" />
            </div>
          )}
          <div className="form-actions">
            {success && <span className="success-text">Your wish was sent and the download is ready. 🎊</span>}
            {error && <span className="form-error">{error}</span>}
            <button className="btn" type="submit" disabled={submitting || uploading || generating}>{submitting || generating ? 'Preparing... ✨' : '💌 Send Wish & Download Card'}</button>
            <button className="btn btn-secondary" type="button" onClick={handleGenerateOnly} disabled={submitting || uploading || generating}>{generating ? 'Generating...' : 'Download Wish Card'}</button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => setShowPreview((current) => !current)}
              disabled={!form.name.trim() || !form.message.trim()}
            >
              {showPreview ? 'Hide preview' : 'Preview card'}
            </button>
          </div>
          {showPreview && (
            <div className="wish-preview-card">
              <WishCard wish={{ ...form, voiceUrl: audioUrl, imageUrl: imagePreview }} preview heading="Happy Birthday Stuti" />
            </div>
          )}
          {wishReceipt && (
            <div className="card receipt-card">
              <span className="card-kicker">📜 Private receipt</span>
              <p>This wish receipt is kept locally for you only.</p>
              <ul>
                <li><strong>From:</strong> {wishReceipt.name}</li>
                <li><strong>Mood:</strong> {wishReceipt.mood || '—'}</li>
                <li><strong>Message:</strong> {wishReceipt.message}</li>
                {wishReceipt.voiceSeconds > 0 && <li><strong>Voice note:</strong> {wishReceipt.voiceSeconds}s</li>}
                <li><strong>Saved:</strong> {new Date(wishReceipt.sentAt).toLocaleString()}</li>
              </ul>
            </div>
          )}
        </motion.form>
      )}
      {celebrating && (
        <div className="wish-confetti" aria-hidden="true">
          {Array.from({ length: 20 }).map((_, index) => <span key={index} />)}
        </div>
      )}

      {!user && (
        <div className="card quiet-card wish-private-note">
          <span className="card-kicker">Wrapped safely</span>
          <p>Your wish is saved privately. The collected wish wall stays available only after login.</p>
        </div>
      )}

      {user && loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : user && wishes.length ? (
        <div className="grid grid-2 wish-wall">
          {wishes.map((wish) => <WishCard key={wish.id} wish={wish} />)}
        </div>
      ) : user ? (
        <EmptyState title="No wishes yet" message="The wish boxes will appear here as soon as someone sends love." />
      ) : null}
    </main>
  );
};

export default Wishes;
