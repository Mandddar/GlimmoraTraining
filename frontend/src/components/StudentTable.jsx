import { useEffect, useState } from "react";
import api from "../services/api";
import ReccomendationModel from "./ReccomendationModel";

function StudentTable({ refreshTrigger, onEditStudent }) {
  const [students, setStudents] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  const [recommendation, setRecommendation] =
    useState("");

  const fetchStudents = async () => {
    try {
      const response = await api.get("/students");
      setStudents(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteStudent = async (id) => {
    try {
      await api.delete(`/student/${id}`);
      fetchStudents();
    } catch (error) {
      console.error(error);
    }
  };

  const getRecommendation = async (id) => {
    setLoadingId(id);

    try {
      const response = await api.post(
        `/student/${id}/recommendation`
      );

      setRecommendation(
        response.data.recommendation
      );

      setModalOpen(true);
    } catch (error) {
      console.error(error);
      alert("Failed to generate recommendation");
    } finally {
      setLoadingId(null);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [refreshTrigger]);

  return (
    <>
      <h2>Students</h2>

      <table border="1" cellPadding="10">
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
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>{student.course}</td>

              <td>
                <button
                  type="button"
                  onClick={() => onEditStudent(student)}
                >
                  Edit
                </button>

                {" "}

                <button
                  type="button"
                  onClick={() => getRecommendation(student.id)}
                  disabled={loadingId === student.id}
                >
                  {loadingId === student.id
                    ? "Generating..."
                    : "AI Recommendation"}
                </button>

                {" "}

                <button
                  type="button"
                  onClick={() =>
                    deleteStudent(student.id)
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ReccomendationModel
        isOpen={modalOpen}
        recommendation={recommendation}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

export default StudentTable;