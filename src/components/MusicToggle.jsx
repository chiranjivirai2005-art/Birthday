import { useEffect, useRef, useState } from 'react';

const PATTERN = [
  { freq: 392, duration: 0.4 },
  { freq: 392, duration: 0.4 },
  { freq: 440, duration: 0.8 },
  { freq: 392, duration: 0.8 },
  { freq: 523.25, duration: 0.8 },
  { freq: 493.88, duration: 1.2 },
  { freq: 392, duration: 0.4 },
  { freq: 392, duration: 0.4 },
  { freq: 440, duration: 0.8 },
  { freq: 392, duration: 0.8 },
  { freq: 587.33, duration: 0.8 },
  { freq: 523.25, duration: 1.2 },
  { freq: 392, duration: 0.4 },
  { freq: 392, duration: 0.4 },
  { freq: 784, duration: 0.8 },
  { freq: 659.25, duration: 0.8 },
  { freq: 523.25, duration: 0.8 },
  { freq: 493.88, duration: 0.8 },
  { freq: 440, duration: 1.2 },
  { freq: 698.46, duration: 0.4 },
  { freq: 698.46, duration: 0.4 },
  { freq: 659.25, duration: 0.8 },
  { freq: 523.25, duration: 0.8 },
  { freq: 587.33, duration: 0.8 },
  { freq: 523.25, duration: 1.6 },
];

const MusicToggle = () => {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const audioCtxRef = useRef(null);
  const gainRef = useRef(null);
  const noteTimeoutRef = useRef(null);
  const noteIndexRef = useRef(0);

  useEffect(() => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      setError(true);
      return undefined;
    }

    const audioCtx = new AudioContext();
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.0, audioCtx.currentTime);
    gain.connect(audioCtx.destination);

    audioCtxRef.current = audioCtx;
    gainRef.current = gain;

    return () => {
      if (noteTimeoutRef.current) {
        clearTimeout(noteTimeoutRef.current);
      }
      if (audioCtx.state !== 'closed') {
        audioCtx.close().catch(() => {});
      }
    };
  }, []);

  const playNote = (frequency, duration) => {
    const audioCtx = audioCtxRef.current;
    const gain = gainRef.current;
    if (!audioCtx || !gain) return;

    const osc = audioCtx.createOscillator();
    const noteGain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = frequency;

    noteGain.gain.setValueAtTime(0, audioCtx.currentTime);
    noteGain.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 0.02);
    noteGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);

    osc.connect(noteGain);
    noteGain.connect(gain);
    osc.start();
    osc.stop(audioCtx.currentTime + duration + 0.05);
  };

  const scheduleNextNote = () => {
    const current = PATTERN[noteIndexRef.current];
    if (!current) return;
    playNote(current.freq, current.duration);
    const delay = current.duration * 1000 + 120;
    noteIndexRef.current = (noteIndexRef.current + 1) % PATTERN.length;
    noteTimeoutRef.current = window.setTimeout(scheduleNextNote, delay);
  };

  const startMusic = async () => {
    const audioCtx = audioCtxRef.current;
    if (!audioCtx) {
      setError(true);
      return;
    }

    setLoading(true);
    setError(false);

    try {
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      setPlaying(true);
      setLoading(false);
      gainRef.current.gain.setTargetAtTime(0.16, audioCtx.currentTime, 0.02);

      noteIndexRef.current = 0;
      scheduleNextNote();
    } catch {
      setError(true);
      setLoading(false);
      setPlaying(false);
    }
  };

  const stopMusic = () => {
    if (noteTimeoutRef.current) {
      clearTimeout(noteTimeoutRef.current);
      noteTimeoutRef.current = null;
    }
    const audioCtx = audioCtxRef.current;
    const gain = gainRef.current;
    if (gain && audioCtx) {
      gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.01);
    }
    setPlaying(false);
    setLoading(false);
  };

  const toggleMusic = () => {
    if (playing) {
      stopMusic();
      return;
    }
    startMusic();
  };

  const label = error
    ? 'Unable to play birthday music'
    : loading
    ? 'Loading birthday music…'
    : playing
    ? 'Pause birthday music'
    : 'Play birthday music';

  return (
    <button
      className={`nav-link nav-music-toggle ${playing ? 'playing' : ''} ${loading ? 'loading' : ''} ${error ? 'error' : ''}`}
      type="button"
      onClick={toggleMusic}
      aria-pressed={playing}
      aria-label={label}
      title={label}
    >
      <span className="music-icon">{error ? '⚠️' : loading ? '⏳' : playing ? '🔇' : '🎶'}</span>
      <span className="music-status">
        {error ? 'Error' : loading ? 'Loading' : playing ? 'Playing' : 'Play'}
      </span>
      {playing && <span className="music-pulse" aria-hidden="true" />}
    </button>
  );
};

export default MusicToggle;
