import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/date';
import { downloadBlob, downloadWishStatus, makeSafeName } from '../utils/wishDownload';
import { updateItem } from '../services/firestore';

const WishCard = ({ wish, preview = false, heading }) => {
  const { isAdmin, isSpecial, isLoggedIn } = useAuth();
  const [pinning, setPinning] = useState(false);
  const canPin = !preview && (isAdmin || isSpecial);
  const showAudio = wish.voiceUrl && (preview || isLoggedIn);
  const pinned = Boolean(wish.pinned);

  const downloadPicture = async () => {
    if (!wish.imageUrl) return;
    try {
      const response = await fetch(wish.imageUrl);
      const blob = await response.blob();
      downloadBlob(blob, `${makeSafeName(wish.name)}-wish-picture`);
    } catch {
      window.open(wish.imageUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const togglePin = async () => {
    if (!wish.id) return;
    setPinning(true);
    try {
      await updateItem('wishes', wish.id, { pinned: !pinned });
    } finally {
      setPinning(false);
    }
  };

  return (
    <motion.article
      className={`card wish-card ${preview ? 'wish-card-preview' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
    >
      <div className="wish-card-meta">
        <span className="card-kicker">{preview ? '🧾 Wish preview' : '💝 Birthday wish'}</span>
        <div className="wish-card-tags">
          {wish.mood && <span className="wish-badge mood-badge">{wish.mood}</span>}
          {pinned && !preview && <span className="wish-badge">📌 Pinned</span>}
        </div>
      </div>

      {preview ? (
        <div className="status-preview">
          <div className="status-inner">
              <div className="status-decorations" aria-hidden>
                <div className="balloon b1" />
                <div className="balloon b2" />
                <div className="balloon b3" />
                <div className="popper p1" />
                <div className="popper p2" />
              </div>
              <div className="status-header">{heading || 'Happy Birthday Stuti'}</div>
              <div className="status-body">
              {wish.imageUrl ? (
                <div className="status-image-frame">
                  <img src={wish.imageUrl} alt={`Wish from ${wish.name}`} />
                </div>
              ) : null}
              <div className="status-text">
                <p className="wish-message">{wish.message}</p>
                {showAudio && (
                  <div className="wish-audio">
                    <audio controls src={wish.voiceUrl} preload="none">Your browser does not support audio playback.</audio>
                  </div>
                )}
                <div className="card-footer">
                  <strong>{wish.name}</strong>
                  <span>Preview</span>
                </div>
              </div>
            </div>
            <div className="status-footer">Made with a birthday wish</div>
          </div>
        </div>
      ) : (
        <>
          {wish.imageUrl && (
            <img className="wish-image" src={wish.imageUrl} alt={`Wish from ${wish.name}`} loading="lazy" />
          )}

          <div className="wish-card-content">
            <p className="wish-message">{wish.message}</p>

            {showAudio && (
              <div className="wish-audio">
                <audio controls src={wish.voiceUrl} preload="none">
                  Your browser does not support audio playback.
                </audio>
              </div>
            )}

            <div className="card-footer">
              <strong>{wish.name}</strong>
              <span>{`✨ ${formatDate(wish.createdAt, { month: 'short' })}`}</span>
            </div>
          </div>
        </>
      )}

      {!preview && (
        <div className="wish-downloads">
          {wish.imageUrl && <button className="btn btn-secondary btn-small" type="button" onClick={downloadPicture}>Download picture</button>}
          <button className="btn btn-small" type="button" onClick={() => downloadWishStatus(wish, { heading: 'Thank You' })}>Download for status</button>
          {canPin && (
            <button className="btn btn-secondary btn-small" type="button" onClick={togglePin} disabled={pinning}>
              {pinned ? 'Unpin' : 'Pin'}
            </button>
          )}
        </div>
      )}
    </motion.article>
  );
};

export default WishCard;
