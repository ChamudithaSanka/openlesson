import React, { useEffect, useState, useCallback } from 'react';
import { HelpCircle, Clock, BookOpen, Search, Award } from 'lucide-react';
import StudentLayout from '../../components/student/StudentLayout';

const API = 'http://localhost:5000';

const StudentQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const enrolledTeachers = JSON.parse(localStorage.getItem('enrolledTeachers') || '[]');
      const enrolledTeacherIds = enrolledTeachers.map((t) => t._id);

      const res = await fetch(`${API}/api/quizzes`);
      const data = await res.json();
      const all = data.quizzes || [];

      // Filter to only quizzes from enrolled teachers
      const filtered =
        enrolledTeacherIds.length > 0
          ? all.filter((q) => {
              const tid =
                typeof q.createdBy === 'object' ? q.createdBy?._id : q.createdBy;
              return enrolledTeacherIds.includes(String(tid));
            })
          : all;

      setQuizzes(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleStartQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setAnswers({});
    setSubmitted(false);
    setScore(null);
  };

  const handleAnswer = (questionIdx, optionIdx, type) => {
    setAnswers((prev) => {
      if (type === 'single') {
        return { ...prev, [questionIdx]: [optionIdx] };
      } else {
        const current = prev[questionIdx] || [];
        const exists = current.includes(optionIdx);
        return {
          ...prev,
          [questionIdx]: exists ? current.filter((i) => i !== optionIdx) : [...current, optionIdx],
        };
      }
    });
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;
    let earned = 0;
    activeQuiz.questions.forEach((q, idx) => {
      const userAnswers = answers[idx] || [];
      const correct = q.correctAnswers || [];
      const isCorrect =
        userAnswers.length === correct.length &&
        correct.every((c) => userAnswers.includes(c));
      if (isCorrect) earned += q.points || 1;
    });
    setScore(earned);
    setSubmitted(true);
  };

  const filtered = quizzes.filter((q) => {
    const s = searchTerm.toLowerCase();
    return (
      q.title?.toLowerCase().includes(s) ||
      q.subjectId?.subjectName?.toLowerCase().includes(s) ||
      q.gradeId?.gradeName?.toLowerCase().includes(s)
    );
  });

  // Quiz Taking Modal
  if (activeQuiz) {
    return (
      <StudentLayout title="Quiz">
        <div className="p-8 max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            {/* Quiz Header */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white">
              <h2 className="text-2xl font-bold">{activeQuiz.title}</h2>
              <div className="flex items-center gap-4 mt-2 text-yellow-100 text-sm">
                <span className="flex items-center gap-1"><Clock size={14} /> {activeQuiz.duration} min</span>
                <span className="flex items-center gap-1"><HelpCircle size={14} /> {activeQuiz.questions?.length} questions</span>
                <span className="flex items-center gap-1"><Award size={14} /> {activeQuiz.totalPoints} pts</span>
              </div>
            </div>

            {submitted ? (
              <div className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                  <Award size={36} className="text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Quiz Submitted!</h3>
                <p className="text-gray-500 mt-2">Your score</p>
                <p className="text-5xl font-bold text-yellow-600 mt-3">
                  {score} / {activeQuiz.totalPoints}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {Math.round((score / activeQuiz.totalPoints) * 100)}% correct
                </p>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
                >
                  Back to Quizzes
                </button>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {activeQuiz.questions?.map((q, qIdx) => (
                  <div key={qIdx} className="border border-gray-100 rounded-xl p-5 bg-gray-50">
                    <p className="font-semibold text-gray-800 mb-3">
                      <span className="text-yellow-600 font-bold">{qIdx + 1}.</span> {q.questionText}
                      <span className="ml-2 text-xs text-gray-400">({q.points} pt{q.points !== 1 ? 's' : ''})</span>
                    </p>
                    <div className="space-y-2">
                      {q.options?.map((opt, optIdx) => {
                        const selected = (answers[qIdx] || []).includes(optIdx);
                        return (
                          <label
                            key={optIdx}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border-2 transition ${
                              selected
                                ? 'border-yellow-400 bg-yellow-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <input
                              type={q.questionType === 'single' ? 'radio' : 'checkbox'}
                              checked={selected}
                              onChange={() => handleAnswer(qIdx, optIdx, q.questionType)}
                              className="w-4 h-4 text-yellow-500"
                            />
                            <span className="text-sm text-gray-700">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setActiveQuiz(null)}
                    className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitQuiz}
                    className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold transition"
                  >
                    Submit Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="Quizzes">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Quizzes</h1>
          <p className="text-gray-500 mt-2">Quizzes from teachers you're enrolled in.</p>
        </div>

        <div className="relative mb-8 max-w-lg">
          <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 transition text-sm"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500 mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <HelpCircle size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium text-lg">No quizzes available</p>
            <p className="text-gray-400 text-sm mt-1">
              {quizzes.length === 0 ? 'Enroll in teachers to see their quizzes.' : 'Try adjusting your search.'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-5">
              <span className="font-semibold text-gray-700">{filtered.length}</span> quiz{filtered.length !== 1 ? 'zes' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((quiz) => (
                <div
                  key={quiz._id}
                  className="bg-white rounded-xl shadow-sm border-l-4 border-yellow-500 p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-bold text-gray-800 flex-1 line-clamp-2">{quiz.title}</h3>
                    <BookOpen className="text-yellow-500 flex-shrink-0 ml-2" size={20} />
                  </div>

                  <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                    <p><span className="font-medium text-gray-700">Subject:</span> {quiz.subjectId?.subjectName || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Grade:</span> {quiz.gradeId?.gradeName || 'N/A'}</p>
                    {quiz.description && (
                      <p className="text-gray-500 text-xs line-clamp-2 mt-1">{quiz.description}</p>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Questions</span>
                      <span className="font-semibold text-gray-800">{quiz.questions?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Points</span>
                      <span className="font-semibold text-gray-800">{quiz.totalPoints || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration</span>
                      <span className="font-semibold text-gray-800">{quiz.duration} min</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartQuiz(quiz)}
                    className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold text-sm transition"
                  >
                    Start Quiz
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentQuizzes;