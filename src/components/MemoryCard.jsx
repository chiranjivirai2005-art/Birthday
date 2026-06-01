import { motion } from 'framer-motion';
import { formatDate } from '../utils/date';

const MemoryCard = ({ memory }) => {
  return (
    <motion.article
      className="card memory-card"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
    >
      {memory.imageUrl && <img className="card-image" src={memory.imageUrl} alt={memory.title} loading="lazy" />}
      <span className="card-kicker">{formatDate(memory.date)}</span>
      <h3>{memory.title}</h3>
      <p>{memory.description}</p>
    </motion.article>
  );
};

export default MemoryCard;
