import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

const FloatingHearts = () => {
  const { user, isSpecial } = useAuth();
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    if (!user) {
      setHearts([]);
      return undefined;
    }

    setHearts(Array.from({ length: isSpecial ? 9 : 5 }, (_, index) => ({
      id: `${index}-${Math.random()}`,
      x: Math.random() * 100,
      size: 12 + Math.random() * (isSpecial ? 13 : 8),
      delay: Math.random() * 6,
      duration: 11 + Math.random() * 8,
    })));

    const interval = setInterval(() => {
      const heart = {
        id: Date.now() + Math.random(),
        x: Math.random() * 100,
        size: 12 + Math.random() * (isSpecial ? 13 : 8),
        delay: 0,
        duration: 11 + Math.random() * 8,
      };
      setHearts((current) => [...current.slice(isSpecial ? -13 : -8), heart]);
    }, isSpecial ? 1900 : 2700);

    return () => clearInterval(interval);
  }, [user, isSpecial]);

  if (!user) return null;

  return (
    <div className={`floating-hearts ${isSpecial ? 'special' : ''}`}>
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="heart"
          initial={{ x: `${heart.x}vw`, y: '104vh', opacity: 0, scale: 0.8 }}
          animate={{ y: '-12vh', opacity: [0, 0.24, 0.18, 0], x: `${heart.x + 4}vw`, scale: [0.8, 1, 0.95] }}
          transition={{ duration: heart.duration, delay: heart.delay, ease: 'easeOut' }}
          style={{ left: `${heart.x}vw`, width: heart.size, height: heart.size }}
        >
          <span />
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingHearts;
