import Header from "./components/Header";
import Footer from "./components/Footer";
import { Route, Routes, useLocation } from "react-router-dom";
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
import DonorDashboardOverview from "./pages/donor/DonorDashboardOverview";
import DonationHistoryPage from "./pages/donor/DonationHistoryPage";
import PaymentMethodsPage from "./pages/donor/PaymentMethodsPage";
import ProfileSettingsPage from "./pages/donor/ProfileSettingsPage";
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

export default function App() {
  const location = useLocation();
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const type = localStorage.getItem("userType");
    setUserType(type);
  }, [location.pathname]);

  const hideFooter = userType === "admin" || location.pathname.startsWith("/donor");

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

        {/* Donor Routes */}
        <Route
          path="/donor/dashboard"
          element={
            <ProtectedRoute allowedRoles={["donor"]}>
              <DonorDashboardOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donor/history"
          element={
            <ProtectedRoute allowedRoles={["donor"]}>
              <DonationHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donor/payments"
          element={
            <ProtectedRoute allowedRoles={["donor"]}>
              <PaymentMethodsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donor/settings"
          element={
            <ProtectedRoute allowedRoles={["donor"]}>
              <ProfileSettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/complaints"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ComplaintManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-users/teachers"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TeachersManagement />
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/quizzes"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherQuizzes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/study-materials"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherStudyMaterials />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/study-sessions"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
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
      {!hideFooter && <Footer />}
    </div>
  );
}