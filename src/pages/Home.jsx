import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { createWish, subscribeWishes } from '../services/firestore';
import WishCard from '../components/WishCard';
import { downloadWishStatus } from '../utils/wishDownload';
import { getBirthdayCountdown } from '../utils/date';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { birthdayDate } from '../config/env';

const surpriseNotes = [
  '✨ A little sparkle has been saved for the birthday queen.',
  '🕯️ One candle wish unlocked. Spend it on something wildly happy.',
  '🎈 The balloons approve of this visit.',
  '🍰 Tiny reminder: today deserves extra cake.',
];

const moodOptions = ['Emotional', 'Funny', 'Blessing', 'Memory', 'Cute'];

const journeyLinks = [
  {
    number: '01',
    emoji: '💌',
    title: 'Wishes',
    text: 'Warm words gathered into elegant keepsake cards.',
    to: '/wishes',
  },
  {
    number: '02',
    emoji: '📸',
    title: 'Gallery',
    text: 'A polished visual collection with admin-managed uploads.',
    to: '/gallery',
  },
  {
    number: '03',
    emoji: '💖',
    title: 'Private Moments',
    text: 'An intimate memory space for the special person and admins.',
    to: '/private-moments',
  },
  {
    number: '04',
    emoji: '🌟',
    title: 'Special Days',
    text: 'A graceful timeline of milestones that deserve to be remembered.',
    to: '/special-days',
  },
];

const Home = () => {
  const { user, isAdmin, isSpecial } = useAuth();
  const canSeePrivateJourney = isAdmin || isSpecial;
  const [wishes, setWishes] = useState([]);
  const [wishForm, setWishForm] = useState({ name: '', message: '', mood: '' });
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [wishSent, setWishSent] = useState(false);
  const [wishReceipt, setWishReceipt] = useState(null);
  const [activeSurprise, setActiveSurprise] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { recording, audioUrl, duration, error: recordError, startRecording, stopRecording, clearRecording, uploadRecording } = useVoiceRecorder();

  useEffect(() => {
    if (!user) {
      setWishes([]);
      return undefined;
    }

    const unsubscribe = subscribeWishes(setWishes, 3);
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('lastWishReceipt');
      if (saved) {
        setWishReceipt(JSON.parse(saved));
      }
    } catch {
      // ignore local storage failures
    }
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const submitWish = async (event) => {
    event.preventDefault();
    if (!wishForm.name.trim() || !wishForm.message.trim()) return;
    setSubmitting(true);
    setWishSent(false);
    setShowPreview(false);

    try {
      const voiceUrl = audioUrl ? await uploadRecording() : '';
      const wishDraft = {
        name: wishForm.name.trim(),
        message: wishForm.message.trim(),
        mood: wishForm.mood,
        voiceUrl,
        imageUrl: '',
      };

      await createWish(wishDraft);
      setGenerating(true);
      await downloadWishStatus(wishDraft, { heading: 'Happy Birthday Stuti' });
      window.alert('Your landscape wish card is ready. Use the downloaded image for your status/story wishing.');

      const receipt = {
        name: wishDraft.name,
        message: wishDraft.message,
        mood: wishDraft.mood,
        voiceSeconds: duration,
        sentAt: new Date().toISOString(),
      };
      setWishReceipt(receipt);
      try {
        window.localStorage.setItem('lastWishReceipt', JSON.stringify(receipt));
      } catch {
        // ignore local storage failures
      }

      setWishForm({ name: '', message: '', mood: '' });
      clearRecording();
      setWishSent(true);
    } finally {
      setGenerating(false);
      setSubmitting(false);
    }
  };

  const downloadWishCard = async () => {
    if (!wishForm.name.trim() || !wishForm.message.trim()) return;
    setGenerating(true);
    try {
      await downloadWishStatus({
        name: wishForm.name.trim(),
        message: wishForm.message.trim(),
        mood: wishForm.mood,
        voiceUrl: audioUrl || '',
        imageUrl: '',
      }, { heading: 'Happy Birthday Stuti' });
      window.alert('Your landscape wish card is ready. Use the downloaded image for your status/story wishing.');
    } finally {
      setGenerating(false);
    }
  };

  const revealSurprise = () => {
    setActiveSurprise((current) => (current + 1) % surpriseNotes.length);
  };

  return (
    <main className={`home-page ${isSpecial ? 'special-home' : ''}`}>
      <section className="hero">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <div className="balloon balloon-left" />
        <div className="balloon balloon-right" />
        <div className="birthday-stage" aria-hidden="true">
          <div className="cake-stack">
            <span className="candle candle-one" />
            <span className="candle candle-two" />
            <span className="candle candle-three" />
            <div className="cake-top" />
            <div className="cake-middle" />
            <div className="cake-bottom" />
          </div>
          <div className="cartoon-buddy buddy-left">
            <span className="buddy-hair" />
            <span className="buddy-face" />
            <span className="buddy-body" />
            <span className="buddy-arm" />
            <span className="buddy-note">oops</span>
          </div>
          <div className="cartoon-buddy buddy-right">
            <span className="buddy-hair" />
            <span className="buddy-face" />
            <span className="buddy-body" />
            <span className="buddy-arm" />
            <span className="buddy-note">yay</span>
          </div>
        </div>
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <span className="eyebrow">🎂 Cake, candles, balloons, and wishes</span>
          <h1>{isSpecial ? 'Happy Birthday Stuti 💖' : 'Happy Birthday Stuti 🎉'}</h1>
          <p>
            {isSpecial
              ? 'This birthday world is bursting with balloons, cake, silly little surprises, wishes, memories, and everything made just for you. ✨'
              : user
                ? 'A happy birthday corner with wishes, photos, candles, cakes, and carefully protected memories. 🎁'
                : 'A bright birthday party page. Send a wish in the little booth below, and login opens the private surprises. 💌'}
          </p>
          <div className="hero-actions">
            {user ? (
              <>
                <Link to="/wishes" className="btn">💌 Open Wishes</Link>
                <Link to="/gallery" className="btn btn-secondary">📸 View Gallery</Link>
              </>
            ) : (
              <Link to="/login" className="btn">🔐 Login to Continue</Link>
            )}
          </div>
          {(() => {
            const countdown = getBirthdayCountdown(birthdayDate, currentTime);
            const pad = (value) => String(value).padStart(2, '0');
            return (
              <div className="birthday-countdown">
                {countdown?.isToday ? (
                  <div className="birthday-countdown-title">Today is Stuti Day 🎉</div>
                ) : (
                  <div className="countdown-grid">
                    <div className="countdown-unit">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={countdown?.days ?? 0}
                          initial={{ opacity: 0, y: -18 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 18 }}
                          transition={{ duration: 0.24, ease: 'easeOut' }}
                        >
                          {countdown?.days ?? 0}
                        </motion.span>
                      </AnimatePresence>
                      <small>days</small>
                    </div>
                    <div className="countdown-unit">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={countdown?.hours ?? 0}
                          initial={{ opacity: 0, y: -18 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 18 }}
                          transition={{ duration: 0.24, ease: 'easeOut' }}
                        >
                          {pad(countdown?.hours ?? 0)}
                        </motion.span>
                      </AnimatePresence>
                      <small>hours</small>
                    </div>
                    <div className="countdown-unit">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={countdown?.minutes ?? 0}
                          initial={{ opacity: 0, y: -18 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 18 }}
                          transition={{ duration: 0.24, ease: 'easeOut' }}
                        >
                          {pad(countdown?.minutes ?? 0)}
                        </motion.span>
                      </AnimatePresence>
                      <small>minutes</small>
                    </div>
                    <div className="countdown-unit">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={countdown?.seconds ?? 0}
                          initial={{ opacity: 0, y: -18 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 18 }}
                          transition={{ duration: 0.24, ease: 'easeOut' }}
                        >
                          {pad(countdown?.seconds ?? 0)}
                        </motion.span>
                      </AnimatePresence>
                      <small>seconds</small>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
          <motion.div
            key={activeSurprise}
            className="surprise-note"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            {surpriseNotes[activeSurprise]}
          </motion.div>
          <div className="party-stats" aria-label="Birthday party highlights">
            <div>
              <strong>{user ? wishes.length : 'Private'}</strong>
              <span>fresh wishes 💌</span>
            </div>
            <div>
              <strong>{canSeePrivateJourney ? 'Open' : 'Locked'}</strong>
              <span>memory path 🔐</span>
            </div>
            <div>
              <strong>{isSpecial ? 'You' : 'Joy'}</strong>
              <span>guest of honor 👑</span>
            </div>
          </div>
          {user && (
            <motion.div
              className="welcome-panel"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
            >
              <strong>{isSpecial ? 'Welcome to your birthday keepsake. 💝' : 'Welcome back. ✨'}</strong>
              <span>{isSpecial ? 'Every section is open for you. 🎀' : 'Your visit is saved with a softer glow. 🌙'}</span>
            </motion.div>
          )}
          {!user && (
            <motion.form
              className="card wish-form hero-wish-booth"
              onSubmit={submitWish}
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.42, duration: 0.55 }}
            >
              <span className="card-kicker">💌 Wish Stuti</span>
                <div className="mood-list" aria-label="Choose a mood">
                {moodOptions.map((mood) => (
                  <button
                    key={mood}
                    type="button"
                    className={`mood-button ${wishForm.mood === mood ? 'mood-button-active' : ''}`}
                    onClick={() => setWishForm({ ...wishForm, mood })}
                  >
                    {mood}
                  </button>
                ))}
              </div>
              <input
                className="input"
                placeholder="Your name"
                value={wishForm.name}
                onChange={(event) => setWishForm({ ...wishForm, name: event.target.value })}
                maxLength={80}
                required
              />
              <textarea
                className="textarea"
                placeholder="Write your birthday wish..."
                value={wishForm.message}
                onChange={(event) => setWishForm({ ...wishForm, message: event.target.value })}
                maxLength={600}
                required
              />
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
                {wishSent && <span className="success-text">Your wish was added. 🎉</span>}
                <button className="btn" type="submit" disabled={submitting || generating}>{submitting || generating ? 'Preparing... ✨' : '💌 Send Wish & Download Card'}</button>
                <button className="btn btn-secondary" type="button" onClick={downloadWishCard} disabled={submitting || generating}>{generating ? 'Generating...' : 'Download Wish Card'}</button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => setShowPreview((current) => !current)}
                  disabled={!wishForm.name.trim() || !wishForm.message.trim()}
                >
                  {showPreview ? 'Hide preview' : 'Preview card'}
                </button>
              </div>
              {showPreview && (
                <div className="wish-preview-card">
                  <WishCard wish={{ ...wishForm, voiceUrl: audioUrl }} preview heading="Happy Birthday Stuti" />
                </div>
              )}
              {wishReceipt && (
                <div className="card receipt-card">
                  <span className="card-kicker">📜 Private receipt</span>
                  <p>Your wish has been recorded on this device only.</p>
                  <ul>
                    <li><strong>Name:</strong> {wishReceipt.name}</li>
                    <li><strong>Mood:</strong> {wishReceipt.mood || '—'}</li>
                    <li><strong>Message:</strong> {wishReceipt.message}</li>
                    {wishReceipt.voiceSeconds > 0 && <li><strong>Voice length:</strong> {wishReceipt.voiceSeconds}s</li>}
                    <li><strong>Sent:</strong> {new Date(wishReceipt.sentAt).toLocaleString()}</li>
                  </ul>
                </div>
              )}
            </motion.form>
          )}
        </motion.div>
      </section>
      <section className="landing-wishes">
        <motion.div
          className="section-heading"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="eyebrow">💌 Wish wall</span>
          <h1>Birthday Wishes 🎁</h1>
          <p>{user ? 'Sweet wishes are wrapped into little keepsake boxes for the birthday star.' : 'Your wish is wrapped safely in the booth above. Login opens the wish wall.'}</p>
        </motion.div>
        <div className={`landing-wish-layout ${user ? 'wish-boxes-only' : 'guest-wish-note'}`}>
          {!user && (
            <div className="card quiet-card wish-privacy-note">
              <span className="card-kicker">🎁 Wrapped safely</span>
              <p>Your wish goes straight into the birthday box. The wish wall opens only after login.</p>
            </div>
          )}
          {user && (
            <div className="landing-wish-preview">
              {wishes.length ? (
                wishes.map((wish) => <WishCard key={wish.id} wish={wish} />)
              ) : (
                <div className="card quiet-card">
                  <span className="card-kicker">🌈 First wish</span>
                  <p>The latest wishes will appear here as soon as they are sent. ✨</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      {canSeePrivateJourney && (
        <section className="journey-band">
          {journeyLinks.map((item) => (
            <Link className="journey-link" to={item.to} key={item.to}>
              <span>{item.number} {item.emoji}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
};

export default Home;
