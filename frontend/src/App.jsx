import Header from "./components/Header";
import Footer from "./components/Footer";
import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import AboutPage from "./pages/AboutPage";
import WorkPage from "./pages/WorkPage";
import VolunteerPage from "./pages/VolunteerPage";
import DonatePage from "./pages/DonatePage";
import DonateCheckoutPage from "./pages/DonateCheckoutPage";
import DonationResultPage from "./pages/DonationResultPage";
import ComplaintManagement from "./pages/admin/ComplaintManagement";
import AnnouncementManagement from "./pages/admin/AnnouncementManagement";
import TeachersManagement from "./pages/admin/TeachersManagement";
import DonorDashboardOverview from "./pages/donor/DonorDashboardOverview";
import DonationHistoryPage from "./pages/donor/DonationHistoryPage";
import ProfileSettingsPage from "./pages/donor/ProfileSettingsPage";
import SubscriptionSettingsPage from "./pages/donor/SubscriptionSettingsPage";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherQuizzes from "./pages/TeacherQuizzes";
import TeacherStudyMaterials from "./pages/TeacherStudyMaterials";
import TeacherStudySessions from "./pages/TeacherStudySessions";
import TeacherAnnouncements from "./pages/TeacherAnnouncements";
import TeacherProfile from "./pages/TeacherProfile";
import StudentManagement from "./pages/admin/StudentManagement";
import DonorManagement from "./pages/admin/DonorManagement";
import DonationManagement from "./pages/admin/DonationManagement";
import GradeManagement from "./pages/admin/GradeManagement";
import SubjectManagement from "./pages/admin/SubjectManagement";
import FeedbackManagement from "./pages/admin/FeedbackManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext.jsx";

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentTeachers from './pages/student/StudentTeachers';
import StudentSubjects from './pages/student/StudentSubjects';
import StudentEnrolledTeachers from './pages/student/StudentEnrolledTeachers';
import StudentEnrolledSubjects from './pages/student/StudentEnrolledSubjects';
import StudentSessions from './pages/student/StudentSessions';
import StudentQuizzes from './pages/student/StudentQuizzes';
import StudentFeedback from './pages/student/StudentFeedback';
import StudentComplaints from './pages/student/StudentComplaints';
import StudentProfile from './pages/student/StudentProfile';


export default function App() {
  const location = useLocation();
  const { userType } = useAuth();

  const hideFooter =
    location.pathname.startsWith("/admin")
    location.pathname.startsWith("/donor") ||
    location.pathname.startsWith("/teacher");

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/volunteer" element={<VolunteerPage />} />
        <Route path="/donate" element={<DonatePage />} />
        <Route path="/donate/checkout" element={<DonateCheckoutPage />} />
        <Route path="/donate/return" element={<DonationResultPage />} />
        <Route path="/donate/cancel" element={<DonationResultPage />} />
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
          path="/donor/settings"
          element={
            <ProtectedRoute allowedRoles={["donor"]}>
              <ProfileSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donor/subscription"
          element={
            <ProtectedRoute allowedRoles={["donor"]}>
              <SubscriptionSettingsPage />
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
          path="/admin/announcements"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AnnouncementManagement />
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
          path="/teacher/announcements"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherAnnouncements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/profile"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherProfile />
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
        <Route
          path="/admin/feedback"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <FeedbackManagement />
            </ProtectedRoute>
          }
        />



        <Route path="/student/dashboard"        element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/teachers"         element={<ProtectedRoute allowedRoles={['student']}><StudentTeachers /></ProtectedRoute>} />
        <Route path="/student/subjects"         element={<ProtectedRoute allowedRoles={['student']}><StudentSubjects /></ProtectedRoute>} />
        <Route path="/student/enrolled-teachers" element={<ProtectedRoute allowedRoles={['student']}><StudentEnrolledTeachers /></ProtectedRoute>} />
        <Route path="/student/enrolled-subjects" element={<ProtectedRoute allowedRoles={['student']}><StudentEnrolledSubjects /></ProtectedRoute>} />
        <Route path="/student/sessions"         element={<ProtectedRoute allowedRoles={['student']}><StudentSessions /></ProtectedRoute>} />
        <Route path="/student/quizzes"          element={<ProtectedRoute allowedRoles={['student']}><StudentQuizzes /></ProtectedRoute>} />
        <Route path="/student/feedback"         element={<ProtectedRoute allowedRoles={['student']}><StudentFeedback /></ProtectedRoute>} />
        <Route path="/student/complaints"       element={<ProtectedRoute allowedRoles={['student']}><StudentComplaints /></ProtectedRoute>} />
        <Route path="/student/profile"          element={<ProtectedRoute allowedRoles={['student']}><StudentProfile /></ProtectedRoute>} />



      </Routes>
      {!hideFooter && <Footer />}
    </div>
  );
}