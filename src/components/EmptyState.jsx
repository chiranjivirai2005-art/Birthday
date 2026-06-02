const EmptyState = ({ title, message }) => (
  <div className="empty-state">
    <span />
    <h3>{title}</h3>
    <p>{message}</p>
  </div>
);

export default EmptyState;
