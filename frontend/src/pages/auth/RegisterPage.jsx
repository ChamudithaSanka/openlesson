import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    gradeId: '',
    phone: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 1. Validation: No numbers allowed in Name field (Real-time)
    if (name === 'fullName') {
      const alphaValue = value.replace(/[0-9]/g, ''); 
      setFormData({ ...formData, [name]: alphaValue });
    } 
    // 2. Validation: Only numbers allowed in Phone field & limit to 10 (Real-time)
    else if (name === 'phone') {
      const numValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: numValue });
    } 
    else {
      setFormData({ ...formData, [name]: value });
    }
    
    if (error) setError('');
  };

  const validateForm = () => {
    const { fullName, email, password, confirmPassword, gradeId, phone } = formData;

    // Check for empty fields
    if (!fullName || !email || !password || !confirmPassword || !gradeId || !phone) {
      return "All fields are required.";
    }

    // 3. Validation: Valid Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }

    // Password Length
    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }

    // 4. Validation: Password Confirmation Match
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    // 5. Validation: Phone Number must be exactly 10 digits
    if (phone.length !== 10) {
      return "Phone number must be exactly 10 digits.";
    }

    // 6. Validation: Grade must be chosen (handled by the empty check above, but ensures logic)
    if (!gradeId) {
      return "Please select your grade.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      // Exclude confirmPassword from the API request
      const { confirmPassword, ...dataToSubmit } = formData;
      const response = await axios.post('http://localhost:5000/api/register', dataToSubmit);
      console.log(response.data);
      alert("Registration Successful!");
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || "Error during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4f8]">
      
      {/* --- HEADER --- */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-xl shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">OpenLesson</span>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

        <div className="card w-full max-w-md bg-white shadow-2xl rounded-[2.5rem] p-8 border border-white/50 relative z-10">
          
          <div className="text-center mb-6">
            <h1 className="text-3xl font-black text-slate-800 mb-1 tracking-tight">Join OpenLesson!</h1>
            <p className="text-slate-500 text-sm font-medium">Start your learning journey here</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 text-xs font-semibold rounded-r-lg text-center animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="text" 
              name="fullName"
              value={formData.fullName}
              placeholder="Full Name (No Numbers)" 
              className="input input-bordered w-full h-11 rounded-2xl bg-slate-50 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-sm outline-none" 
              onChange={handleChange}
            />

            <input 
              type="email" 
              name="email"
              placeholder="Email Address" 
              className="input input-bordered w-full h-11 rounded-2xl bg-slate-50 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-sm outline-none" 
              onChange={handleChange}
            />

            <div className="grid grid-cols-2 gap-3">
                <input 
                  type="password" 
                  name="password"
                  placeholder="Password" 
                  className="input input-bordered w-full h-11 rounded-2xl bg-slate-50 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-sm outline-none" 
                  onChange={handleChange}
                />
                <input 
                  type="password" 
                  name="confirmPassword"
                  placeholder="Confirm" 
                  className="input input-bordered w-full h-11 rounded-2xl bg-slate-50 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-sm outline-none" 
                  onChange={handleChange}
                />
            </div>

            <select 
              name="gradeId"
              className="select select-bordered w-full h-11 rounded-2xl bg-slate-50 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-sm outline-none"
              onChange={handleChange}
              value={formData.gradeId}
            >
              <option value="" disabled>Select Grade</option>
              <option value="650c...1">Grade 1-5</option>
              <option value="650c...2">Grade 6-11</option>
              <option value="650c...3">Grade 12-13</option>
            </select>

            <input 
              type="text" 
              name="phone"
              value={formData.phone}
              placeholder="Phone Number (10 Digits)" 
              className="input input-bordered w-full h-11 rounded-2xl bg-slate-50 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-sm outline-none" 
              onChange={handleChange}
            />

            <button 
              type="submit" 
              disabled={loading}
              className={`btn w-full h-12 rounded-2xl border-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold tracking-widest shadow-lg shadow-blue-200 mt-2 ${loading ? 'loading' : ''}`}
            >
              {loading ? 'REGISTERING...' : 'REGISTER'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400 font-medium">
              Already have an account? <span onClick={() => navigate('/login')} className="text-blue-600 cursor-pointer font-bold hover:underline">Log in</span>
            </p>
          </div>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="w-full bg-white border-t border-slate-100 px-8 py-6 text-center">
        <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">
          © 2026 OpenLesson Secure Registration System
        </p>
      </footer>
    </div>
  );
};

export default Register;