import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import ReccomendationModel from "./ReccomendationModel";

function StudentTable({ refreshTrigger, onEditStudent }) {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [recommendationsGenerated, setRecommendationsGenerated] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [recommendation, setRecommendation] = useState("");

  const fetchStudents = async () => {
    try {
      const response = await api.get("/students");
      setStudents(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Unable to load students. Please try again.");
    }
  };

  const deleteStudent = async (id) => {
    try {
      await api.delete(`/student/${id}`);
      await fetchStudents();
      toast.success("Student deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete student.");
    }
  };

  const getRecommendation = async (id) => {
    setLoadingId(id);

    try {
      const response = await api.post(`/student/${id}/recommendation`);
      setRecommendation(response.data.recommendation);
      setRecommendationsGenerated((count) => count + 1);
      setModalOpen(true);
      toast.success("Recommendation generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate recommendation.");
    } finally {
      setLoadingId(null);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [refreshTrigger]);

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="card card-table">
      <div className="section-header">
        <div>
          <p className="eyebrow">Student Records</p>
          <h2>Students</h2>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span>Total Students</span>
          <strong>{students.length}</strong>
        </div>
        <div className="stat-card">
          <span>AI Recommendations</span>
          <strong>{recommendationsGenerated}</strong>
        </div>
      </div>

      <div className="table-toolbar">
        <div className="search-control">
          <label htmlFor="student-search">Search by name</label>
          <input
            id="student-search"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search students"
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="students-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Course</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.course}</td>
                <td>
                  <div className="action-group">
                    <button
                      type="button"
                      className="btn-blue"
                      onClick={() => onEditStudent(student)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-purple"
                      onClick={() => getRecommendation(student.id)}
                      disabled={loadingId === student.id}
                    >
                      {loadingId === student.id
                        ? "Generating..."
                        : "AI Recommendation"}
                    </button>
                    <button
                      type="button"
                      className="btn-red"
                      onClick={() => deleteStudent(student.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ReccomendationModel
        isOpen={modalOpen}
        recommendation={recommendation}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
}

export default StudentTable;
