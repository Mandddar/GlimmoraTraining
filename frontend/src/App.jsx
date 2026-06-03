import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StudentForm from "./components/StudentForm";
import StudentTable from "./components/StudentTable";
import "./App.css";

function App() {
  const [refresh, setRefresh] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const handleStudentAdded = (message) => {
    setRefresh((current) => !current);
    if (message) {
      toast.success(message, { position: "top-right" });
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
  };

  const handleEditCancelled = () => {
    setEditingStudent(null);
  };

  return (
    <div className="app-shell">
      <div className="page-container">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Student Dashboard</p>
            <h1>Student Management System</h1>
            <p className="page-copy">
              Manage students and generate AI-powered recommendations.
            </p>
          </div>
        </header>

        <div className="grid-layout">
          <StudentForm
            onStudentAdded={handleStudentAdded}
            editingStudent={editingStudent}
            onEditCancelled={handleEditCancelled}
          />

          <StudentTable
            refreshTrigger={refresh}
            onEditStudent={handleEditStudent}
          />
        </div>
      </div>

      <ToastContainer
        theme="colored"
        position="top-right"
        autoClose={2800}
        hideProgressBar={false}
        newestOnTop
      />
    </div>
  );
}

export default App;
