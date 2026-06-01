const PartyDecor = () => (
  <div className="party-decor" aria-hidden="true">
    <div className="floating-emojis">
      {['🎂', '🎈', '✨', '💌', '🎁', '🌟', '💖', '🎊', '🍰', '🕯️'].map((emoji, index) => (
        <span key={`${emoji}-${index}`}>{emoji}</span>
      ))}
    </div>
    <div className="wallpaper-stars">
      {Array.from({ length: 18 }).map((_, index) => (
        <span key={`star-${index}`} />
      ))}
    </div>
    <div className="rising-balloons">
      {Array.from({ length: 12 }).map((_, index) => (
        <span key={`balloon-${index}`} className={`rise-balloon balloon-${index + 1}`} />
      ))}
    </div>
    <div className="party-confetti">
      {Array.from({ length: 28 }).map((_, index) => (
        <span key={`confetti-${index}`} />
      ))}
    </div>
  </div>
);

export default PartyDecor;
