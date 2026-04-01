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
import StudentManagement from "./pages/StudentManagement";
import DonorManagement from "./pages/DonorManagement";
import DonationManagement from "./pages/DonationManagement";
import GradeManagement from "./pages/GradeManagement";
import SubjectManagement from "./pages/SubjectManagement";
import ProtectedRoute from "./components/ProtectedRoute";

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
            <ProtectedRoute>
              <ComplaintManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-users/teachers"
          element={
            <ProtectedRoute>
              <TeachersManagement />
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
      {userType !== "admin" && <Footer />}
    </div>
  );
}