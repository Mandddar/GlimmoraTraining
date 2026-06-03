function StudentCard({ student, onEdit, onRecommendation, onDelete, isLoading }) {
  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="student-card">
      <div className="card-header-row">
        <div className="avatar">{initials}</div>
        <div className="card-info">
          <h3>{student.name}</h3>
          <p className="email">{student.email}</p>
        </div>
      </div>

      <div className="card-course">
        <span className="course-badge">{student.course}</span>
      </div>

      <div className="card-actions">
        <button
          className="action-btn action-edit"
          onClick={() => onEdit(student)}
          title="Edit student"
        >
          Edit
        </button>
        <button
          className="action-btn action-ai"
          onClick={() => onRecommendation(student.id)}
          disabled={isLoading}
          title="Generate AI recommendation"
        >
          {isLoading ? "..." : "Get Recommendation"}
        </button>
        <button
          className="action-btn action-delete"
          onClick={() => onDelete(student.id)}
          title="Delete student"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default StudentCard;
