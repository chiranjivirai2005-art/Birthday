import { motion } from 'framer-motion';
import { formatDate } from '../utils/date';

const SpecialDayCard = ({ day }) => {
  return (
    <motion.article
      className="timeline-item"
      initial={{ opacity: 0, x: -18 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
    >
      <div className="timeline-dot" />
      <div className="timeline-content card">
        {day.imageUrl && <img className="card-image" src={day.imageUrl} alt={day.title} loading="lazy" />}
        <span className="card-kicker">{formatDate(day.date)}</span>
        <h3>{day.title}</h3>
        <p>{day.description}</p>
      </div>
    </motion.article>
  );
};

export default SpecialDayCard;
