import React, { useEffect, useState, useCallback } from 'react';
import { Edit2, Trash2, Plus, X, Search, BookOpen, HelpCircle } from 'lucide-react';
import TeacherLayout from '../components/TeacherLayout';

const TeacherQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'edit'
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [modalStep, setModalStep] = useState(1); // Step 1: Quiz details, Step 2: Add questions
  const [quizQuestions, setQuizQuestions] = useState([]); // Track questions being added
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null); // Track if editing a question
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    subjectId: '',
    gradeId: '',
  });
  const [questionData, setQuestionData] = useState({
    questionText: '',
    questionType: 'single',
    options: ['', '', '', ''],
    correctAnswers: [],
    points: 1,
  });
  const [errors, setErrors] = useState({});

  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch quizzes for the logged-in teacher
  const fetchQuizzes = useCallback(async (teacherId) => {
    try {
      const response = await fetch(`${API_URL}/api/quizzes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch quizzes');

      const data = await response.json();
      
      // Filter quizzes created by the logged-in teacher
      const teacherQuizzes = data.quizzes.filter(q => {
        // Safe extraction of createdBy ID with null checks
        let quizTeacherId = null;
        
        if (q.createdBy) {
          if (typeof q.createdBy === 'object' && q.createdBy._id) {
            quizTeacherId = q.createdBy._id;
          } else if (typeof q.createdBy === 'string') {
            quizTeacherId = q.createdBy;
          }
        }
        
        // Only show if we successfully matched the teacher ID
        if (!quizTeacherId) {
          console.warn('Quiz missing createdBy:', q.title);
          return false;
        }
        
        return String(quizTeacherId) === String(teacherId);
      });
      
      console.log(`Fetched ${data.quizzes.length} total quizzes, ${teacherQuizzes.length} for teacher ${teacherId}`);
      setQuizzes(teacherQuizzes);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setQuizzes([]);
    }
  }, [API_URL]);

  // Fetch teacher profile data
  const fetchTeacherData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/teachers/my-profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch teacher data');

      const data = await response.json();
      if (data.success && data.teacher) {
        setTeacher(data.teacher);
        setSubjects(data.teacher.subjectsTheyTeach || []);
        setGrades(data.teacher.gradesTheyTeach || []);
        await fetchQuizzes(data.teacher._id);
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token, fetchQuizzes]);

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (userType !== 'teacher') {
      window.location.href = '/login';
    }
    fetchTeacherData();
  }, [fetchTeacherData]);

  // Handle create quiz click
  const handleCreateClick = () => {
    setModalType('create');
    setSelectedQuiz(null);
    setFormData({
      title: '',
      description: '',
      duration: 30,
      subjectId: '',
      gradeId: '',
    });
    setQuizQuestions([]);
    setErrors({});
    setModalStep(1);
    setShowAddQuestion(false);
    setEditingQuestionIndex(null);
    setShowModal(true);
    resetQuestions();
  };

  // Handle edit quiz click
  const handleEditClick = (quiz) => {
    setModalType('edit');
    setSelectedQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description || '',
      duration: quiz.duration || 30,
      subjectId: typeof quiz.subjectId === 'object' ? quiz.subjectId._id : quiz.subjectId,
      gradeId: typeof quiz.gradeId === 'object' ? quiz.gradeId._id : quiz.gradeId,
    });
    setQuizQuestions(quiz.questions || []);
    setErrors({});
    setModalStep(2); // Go directly to questions step for editing
    setEditingQuestionIndex(null);
    setShowModal(true);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) || 0 : value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle question input change
  const handleQuestionInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    if (name.startsWith('option-')) {
      const index = parseInt(name.split('-')[1]);
      const newOptions = [...questionData.options];
      newOptions[index] = value;
      setQuestionData(prev => ({
        ...prev,
        options: newOptions
      }));
    } else if (name === 'correctAnswer') {
      const index = parseInt(value);
      if (questionData.questionType === 'single') {
        setQuestionData(prev => ({
          ...prev,
          correctAnswers: checked ? [index] : []
        }));
      } else {
        setQuestionData(prev => ({
          ...prev,
          correctAnswers: checked
            ? [...prev.correctAnswers, index]
            : prev.correctAnswers.filter(i => i !== index)
        }));
      }
    } else {
      setQuestionData(prev => ({
        ...prev,
        [name]: name === 'points' ? parseInt(value) || 1 : value
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.subjectId) newErrors.subjectId = 'Subject is required';
    if (!formData.gradeId) newErrors.gradeId = 'Grade is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate question
  const validateQuestion = () => {
    const newErrors = {};

    if (!questionData.questionText.trim()) newErrors.questionText = 'Question text is required';
    if (questionData.options.some(opt => !opt.trim())) newErrors.options = 'All options must be filled';
    if (questionData.correctAnswers.length === 0) newErrors.correctAnswers = 'Select at least one correct answer';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add question to quiz
  const handleAddQuestion = () => {
    if (!validateQuestion()) return;

    // Validate points is a positive number
    if (!questionData.points || questionData.points < 1) {
      alert('Points must be at least 1');
      return;
    }

    const newQuestion = {
      questionText: questionData.questionText,
      questionType: questionData.questionType,
      options: questionData.options,
      correctAnswers: questionData.correctAnswers,
      points: parseInt(questionData.points) || 1,
    };

    if (editingQuestionIndex !== null) {
      // Update existing question
      const updatedQuestions = [...quizQuestions];
      updatedQuestions[editingQuestionIndex] = newQuestion;
      setQuizQuestions(updatedQuestions);
      alert('Question updated successfully');
    } else {
      // Add new question
      setQuizQuestions([...quizQuestions, newQuestion]);
      alert('Question added successfully');
    }

    resetQuestions();
    setEditingQuestionIndex(null);
    setShowAddQuestion(false);
  };

  // Reset question form
  const resetQuestions = () => {
    setQuestionData({
      questionText: '',
      questionType: 'single',
      options: ['', '', '', ''],
      correctAnswers: [],
      points: 1,
    });
    setErrors({});
  };

  // Delete question from quiz
  const handleDeleteQuestion = (index) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
    }
  };

  // Edit question from quiz
  const handleEditQuestion = (index) => {
    const question = quizQuestions[index];
    setQuestionData({
      questionText: question.questionText,
      questionType: question.questionType,
      options: question.options,
      correctAnswers: question.correctAnswers,
      points: 1,
    });
    setEditingQuestionIndex(index);
    setShowAddQuestion(true);
  };

  // Handle submit (create or update quiz)
  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Must have questions
    if (quizQuestions.length === 0) {
      alert('Quiz must have at least one question');
      return;
    }

    try {
      const payload = {
        ...formData,
        duration: formData.duration || 30,
        createdBy: teacher._id,
        questions: quizQuestions,
        totalPoints: quizQuestions.reduce((sum, q) => sum + (parseInt(q.points) || 1), 0),
      };

      const isEdit = modalType === 'edit';
      const response = await fetch(
        isEdit
          ? `${API_URL}/api/quizzes/${selectedQuiz._id}`
          : `${API_URL}/api/quizzes`,
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEdit ? 'update' : 'create'} quiz`);
      }

      const createdQuiz = await response.json();
      
      // Small delay to ensure backend has fully processed the quiz
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh quizzes list
      await fetchQuizzes(teacher._id);
      
      // Close modal and reset state AFTER successful fetch
      setShowModal(false);
      setModalStep(1);
      setFormData({
        title: '',
        description: '',
        duration: 30,
        subjectId: '',
        gradeId: '',
      });
      setQuizQuestions([]);
      resetQuestions();
      
      alert(`Quiz ${isEdit ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Error creating/updating quiz:', error);
      alert(`Error ${modalType === 'edit' ? 'updating' : 'creating'} quiz: ${error.message}`);
    }
  };

  // Handle delete quiz
  const handleDeleteClick = async (quiz) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        const response = await fetch(`${API_URL}/api/quizzes/${quiz._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to delete quiz');

        setQuizzes(quizzes.filter(q => q._id !== quiz._id));
        alert('Quiz deleted successfully');
      } catch (error) {
        console.error('Error:', error);
        alert('Error deleting quiz');
      }
    }
  };

  // Filter quizzes based on search term
  const filteredQuizzes = quizzes.filter(quiz => {
    const searchLower = searchTerm.toLowerCase();
    const titleMatch = quiz.title.toLowerCase().includes(searchLower);
    const subjectMatch = quiz.subjectId && typeof quiz.subjectId === 'object' 
      ? quiz.subjectId.subjectName.toLowerCase().includes(searchLower)
      : false;
    return titleMatch || subjectMatch;
  });

  if (loading) {
    return (
      <TeacherLayout>
        <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading quizzes...</p>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Quizzes</h1>
            <p className="text-gray-600 mt-2 text-lg">Manage and create quizzes for your students</p>
          </div>
          <button
            onClick={handleCreateClick}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105"
          >
            <Plus size={20} />
            Create Quiz
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by quiz title or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Quizzes Grid */}
        {filteredQuizzes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg font-medium">
              {quizzes.length === 0 ? 'No quizzes created yet' : 'No quizzes match your search'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredQuizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white rounded-lg shadow-sm border-l-4 border-green-600 p-6 hover:shadow-md transition-all duration-300 transform hover:scale-105"
              >
                {/* Quiz Title */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1 line-clamp-2">{quiz.title}</h3>
                  <BookOpen className="text-green-600 flex-shrink-0 ml-2" size={24} />
                </div>

                {/* Subject and Grade Info */}
                <div className="mb-4 space-y-2">
                  <div className="text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-700">Subject: </span>
                      {quiz.subjectId && typeof quiz.subjectId === 'object' ? quiz.subjectId.subjectName : 'N/A'}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-700">Grade: </span>
                      {quiz.gradeId && typeof quiz.gradeId === 'object' ? quiz.gradeId.gradeName : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {quiz.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{quiz.description}</p>
                )}

                {/* Quiz Statistics */}
                <div className="bg-gray-50 rounded-md p-3 mb-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <HelpCircle size={16} className="text-green-600" />
                      Questions:
                    </span>
                    <span className="font-semibold text-gray-900">{quiz.questions ? quiz.questions.length : 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Points:</span>
                    <span className="font-semibold text-gray-900">
                      {quiz.totalPoints ? quiz.totalPoints : (quiz.questions ? quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0) : 0)}
                    </span>
                  </div>
                  {quiz.duration && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-semibold text-gray-900">{quiz.duration} min</span>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(quiz)}
                    className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md text-sm font-medium transition"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(quiz)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Quiz Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">
                {modalType === 'create' ? 'Create New Quiz' : 'Edit Quiz'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setModalStep(1);
                  setShowAddQuestion(false);
                  setEditingQuestionIndex(null);
                  resetQuestions();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* STEP 1: Quiz Details Form */}
              {modalStep === 1 && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quiz Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter quiz title"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      />
                      {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter quiz description"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Subject and Grade */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <select
                        name="subjectId"
                        value={formData.subjectId}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.subjectId ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      >
                        <option value="">Select a subject</option>
                        {subjects.map(subject => (
                          <option key={subject._id} value={subject._id}>
                            {subject.subjectName}
                          </option>
                        ))}
                      </select>
                      {errors.subjectId && <p className="text-red-500 text-sm mt-1">{errors.subjectId}</p>}
                    </div>

                    {/* Grade */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grade
                      </label>
                      <select
                        name="gradeId"
                        value={formData.gradeId}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.gradeId ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      >
                        <option value="">Select a grade</option>
                        {grades.map(grade => (
                          <option key={grade._id} value={grade._id}>
                            {grade.gradeName}
                          </option>
                        ))}
                      </select>
                      {errors.gradeId && <p className="text-red-500 text-sm mt-1">{errors.gradeId}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Add Questions */}
              {modalStep === 2 && (
                <div>
                  {/* Quiz Summary */}
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Quiz</p>
                        <p className="font-semibold text-gray-800">{formData.title}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Subject</p>
                        <p className="font-semibold text-gray-800">
                          {subjects.find(s => s._id === formData.subjectId)?.subjectName || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Grade</p>
                        <p className="font-semibold text-gray-800">
                          {grades.find(g => g._id === formData.gradeId)?.gradeName || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Questions</p>
                        <p className="font-semibold text-gray-800">{quizQuestions.length}</p>
                      </div>
                    </div>
                  </div>

                  {/* Add Question Section */}
                  <div className="border-b mb-6 pb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Add Question</h3>
                      {!showAddQuestion && (
                        <button
                          onClick={() => {
                            setShowAddQuestion(true);
                            setEditingQuestionIndex(null);
                            resetQuestions();
                          }}
                          className="flex items-center gap-2 bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 transition text-sm"
                        >
                          <Plus size={16} />
                          Add Question
                        </button>
                      )}
                    </div>

                    {showAddQuestion && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {/* Question Text */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question Text
                          </label>
                          <textarea
                            name="questionText"
                            value={questionData.questionText}
                            onChange={handleQuestionInputChange}
                            placeholder="Enter your question"
                            rows="2"
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                              errors.questionText ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                            }`}
                          />
                          {errors.questionText && <p className="text-red-500 text-sm mt-1">{errors.questionText}</p>}
                        </div>

                        {/* Question Type and Points */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Question Type
                            </label>
                            <select
                              name="questionType"
                              value={questionData.questionType}
                              onChange={handleQuestionInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="single">Single Answer</option>
                              <option value="multiple">Multiple Answers</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Points
                            </label>
                            <input
                              type="number"
                              name="points"
                              value={questionData.points}
                              onChange={handleQuestionInputChange}
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        {/* Options */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Options (check correct answer)
                          </label>
                          {errors.options && <p className="text-red-500 text-sm mb-2">{errors.options}</p>}
                          {questionData.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2 mb-2">
                              <input
                                type={questionData.questionType === 'single' ? 'radio' : 'checkbox'}
                                name="correctAnswer"
                                value={index}
                                checked={questionData.correctAnswers.includes(index)}
                                onChange={handleQuestionInputChange}
                                className="w-4 h-4"
                              />
                              <input
                                type="text"
                                name={`option-${index}`}
                                value={option}
                                onChange={handleQuestionInputChange}
                                placeholder={`Option ${index + 1}`}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          ))}
                          {errors.correctAnswers && <p className="text-red-500 text-sm mt-1">{errors.correctAnswers}</p>}
                        </div>

                        {/* Add Question Button */}
                        <div className="flex gap-2">
                          <button
                            onClick={handleAddQuestion}
                            className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition font-medium"
                          >
                            {editingQuestionIndex !== null ? 'Update This Question' : 'Add This Question'}
                          </button>
                          <button
                            onClick={() => {
                              setShowAddQuestion(false);
                              setEditingQuestionIndex(null);
                              resetQuestions();
                            }}
                            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Questions List */}
                  {quizQuestions.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Questions Added: {quizQuestions.length}
                      </h3>
                      <div className="space-y-3">
                        {quizQuestions.map((q, index) => (
                          <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium text-gray-800 mb-2">
                                  <span className="text-blue-600 font-bold">{index + 1}.</span> {q.questionText}
                                </p>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <p>
                                    <span className="font-medium">Type:</span> {q.questionType === 'single' ? 'Single Answer' : 'Multiple Answers'}
                                  </p>
                                  <p>
                                    <span className="font-medium">Points:</span> {q.points || 1}
                                  </p>
                                  <p>
                                    <span className="font-medium">Options:</span> {q.options.length}
                                  </p>
                                  <div className="mt-2">
                                    {q.options.map((opt, optIdx) => (
                                      <p key={optIdx} className={`text-xs ${q.correctAnswers.includes(optIdx) ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                                        {q.correctAnswers.includes(optIdx) ? '✓ ' : '○ '} {opt}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <button
                                  onClick={() => handleEditQuestion(index)}
                                  className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 transition text-sm flex items-center gap-1"
                                >
                                  <Edit2 size={16} />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteQuestion(index)}
                                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm flex items-center gap-1"
                                >
                                  <Trash2 size={16} />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-4 p-6 border-t bg-gray-50">
              {modalStep === 1 && (
                <>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setModalStep(1);
                      setEditingQuestionIndex(null);
                      resetQuestions();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (validateForm()) {
                        setModalStep(2);
                        setQuizQuestions(modalType === 'edit' ? selectedQuiz?.questions || [] : []);
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    Add Questions
                  </button>
                </>
              )}

              {modalStep === 2 && (
                <>
                  <button
                    onClick={() => {
                      setModalStep(1);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setModalStep(1);
                      setEditingQuestionIndex(null);
                      resetQuestions();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    {modalType === 'create' ? 'Create Quiz' : 'Update Quiz'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
};

export default TeacherQuizzes;
