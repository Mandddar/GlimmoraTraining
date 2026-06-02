import { useState } from "react";
import StudentForm from "./components/StudentForm";
import StudentTable from "./components/StudentTable";

function App() {
  const [refresh, setRefresh] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const handleStudentAdded = () => {
    setRefresh(!refresh);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
  };

  const handleEditCancelled = () => {
    setEditingStudent(null);
  };

  return (
    <div>
      <h1>Student Management System</h1>

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
  );
}

export default App;