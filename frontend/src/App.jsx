import Header from "./components/Header";
import Footer from "./components/Footer";
import { Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import AboutPage from "./pages/AboutPage";
import WorkPage from "./pages/WorkPage";
import VolunteerPage from "./pages/VolunteerPage";
import DonatePage from "./pages/DonatePage";
import ComplaintManagement from "./pages/ComplaintManagement";
import TeachersManagement from "./pages/TeachersManagement";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherQuizzes from "./pages/TeacherQuizzes";
import TeacherStudyMaterials from "./pages/TeacherStudyMaterials";
import TeacherStudySessions from "./pages/TeacherStudySessions";
import StudentManagement from "./pages/StudentManagement";
import DonorManagement from "./pages/DonorManagement";
import DonationManagement from "./pages/DonationManagement";
import GradeManagement from "./pages/GradeManagement";
import SubjectManagement from "./pages/SubjectManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

export default function App() {
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const type = localStorage.getItem("userType");
    setUserType(type);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/volunteer" element={<VolunteerPage />} />
        <Route path="/donate" element={<DonatePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Admin Routes */}
        <Route
          path="/admin/complaints"
          element={
            <AdminRoute>
              <ComplaintManagement />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/manage-users/teachers"
          element={
            <AdminRoute>
              <TeachersManagement />
            </AdminRoute>
          }
        />

        {/* Teacher Routes */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/quizzes"
          element={
            <ProtectedRoute>
              <TeacherQuizzes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/study-materials"
          element={
            <ProtectedRoute>
              <TeacherStudyMaterials />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/study-sessions"
          element={
            <ProtectedRoute>
              <TeacherStudySessions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-users/students"
          element={
            <ProtectedRoute>
              <StudentManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-users/donors"
          element={
            <ProtectedRoute>
              <DonorManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-donations"
          element={
            <ProtectedRoute>
              <DonationManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/grades"
          element={
            <ProtectedRoute>
              <GradeManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/subjects"
          element={
            <ProtectedRoute>
              <SubjectManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
      {userType !== "admin" && userType !== "teacher" && <Footer />}
    </div>
  );
}