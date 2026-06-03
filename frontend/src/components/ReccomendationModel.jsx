function ReccomendationModel({ isOpen, onClose, recommendation }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-window">
        <div className="modal-header-bar">
          <div>
            <p className="eyebrow">AI Recommendation</p>
            <h3>Study Recommendation</h3>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        <div className="modal-content">
          <p>{recommendation}</p>
        </div>
      </div>
    </div>
  );
}

export default ReccomendationModel;
