import { useEffect, useRef } from "react";
import { toast } from "react-toastify";

function RecommendationPanel({ isOpen, recommendation, onClose, studentName }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="panel-overlay" onClick={onClose} />
      <div className="recommendation-panel" ref={panelRef}>
        <div className="panel-header">
          <div>
            <h2>AI Recommendation</h2>
            <p className="panel-subtitle">for {studentName}</p>
          </div>
          <button className="panel-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="panel-content">
          <div className="recommendation-content">
            <p>{recommendation}</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default RecommendationPanel;
