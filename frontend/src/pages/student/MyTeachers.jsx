import { useEffect, useState } from "react";
import StudentLayout from "../../components/student/Studentlayout";
import { Mail, Phone, BookOpen, Star } from "lucide-react";

export default function MyTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");
  const API_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        // Fetch teachers by the student's grade
        const profileRes = await fetch(`${API_URL}/api/students/my-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = await profileRes.json();
        const student = profileData.student;
        const gradeId = student?.gradeId?._id || student?.gradeId;

        if (gradeId) {
          const teachersRes = await fetch(`${API_URL}/api/students/teachers-by-grade/${gradeId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (teachersRes.ok) {
            const data = await teachersRes.json();
            setTeachers(data.teachers || []);
          }
        }
      } catch (err) {
        console.error("Error fetching teachers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [token]);

  const filtered = teachers.filter(
    (t) =>
      t.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.qualification?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name = "") =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const avatarColors = [
    "bg-blue-600", "bg-green-600", "bg-purple-600",
    "bg-yellow-500", "bg-red-500", "bg-indigo-600",
  ];

  return (
    <StudentLayout title="My Teachers" subtitle="Teachers assigned to your grade">
      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading teachers...</div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-5">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by name or qualification..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />

          <p className="text-sm text-gray-500">
            {filtered.length} teacher{filtered.length !== 1 ? "s" : ""} found
          </p>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="text-blue-400" size={24} />
              </div>
              <p className="text-gray-600 font-medium">No teachers found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchTerm ? "Try a different search term." : "No teachers are assigned to your grade yet."}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {filtered.map((teacher, idx) => (
                <div
                  key={teacher._id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${
                        avatarColors[idx % avatarColors.length]
                      }`}
                    >
                      {getInitials(teacher.fullName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-gray-800">{teacher.fullName}</p>
                          {teacher.qualification && (
                            <p className="text-xs text-blue-600 font-medium mt-0.5">{teacher.qualification}</p>
                          )}
                        </div>
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                          Active
                        </span>
                      </div>

                      {teacher.userId?.email && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                          <Mail size={12} />
                          <span className="truncate">{teacher.userId.email}</span>
                        </div>
                      )}
                      {teacher.phone && (
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                          <Phone size={12} />
                          <span>{teacher.phone}</span>
                        </div>
                      )}

                      {/* Subjects */}
                      {teacher.subjectsTheyTeach?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {teacher.subjectsTheyTeach.slice(0, 3).map((subject) => (
                            <span
                              key={subject._id}
                              className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium"
                            >
                              {subject.subjectName}
                            </span>
                          ))}
                          {teacher.subjectsTheyTeach.length > 3 && (
                            <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                              +{teacher.subjectsTheyTeach.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </StudentLayout>
  );
}
