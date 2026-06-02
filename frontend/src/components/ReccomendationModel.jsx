import { useState } from "react";

function RecommendationModal({
  isOpen,
  onClose,
  recommendation,
}) {
  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>AI Study Recommendation</h2>

        <p>{recommendation}</p>

        <button onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  width: "500px",
  maxWidth: "90%",
};

export default RecommendationModal;