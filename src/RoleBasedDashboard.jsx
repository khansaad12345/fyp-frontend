import { Navigate } from "react-router-dom";
import Dashboard from "./pages/admin/Dashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";

// RoleBasedDashboard Component
const RoleBasedDashboard = () => {
    const role = localStorage.getItem("userRole"); // Assuming you store the role in localStorage after login
  
    switch (role) {
      case "admin":
        return <Dashboard />;
      case "teacher":
        return <TeacherDashboard />;
        case "student":
          return <StudentDashboard />;
      default:
        return <Navigate to="/login" />;
    }
  };
  
  export default RoleBasedDashboard