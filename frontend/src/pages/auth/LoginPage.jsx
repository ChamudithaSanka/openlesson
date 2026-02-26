import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const validateForm = () => {
    const { email, password } = formData;
    if (!email || !password) return "Please fill in all fields.";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address.";
    
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
      const response = await axios.post('http://localhost:5000/api/login', formData);
      // Store token (standard practice)
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('studentName', response.data.fullName);
      
      alert(`Welcome back, ${response.data.fullName}!`);
      navigate('/dashboard'); // Redirect after login
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4f8]">
      
      {/* --- DUMMY HEADER --- */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-xl shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">OpenLesson</span>
        </div>
        <button onClick={() => navigate('/register')} className="text-sm font-semibold text-blue-600 hover:text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all">
            Join Now
        </button>
      </header>

      {/* --- LOGIN FORM SECTION --- */}
      <main className="flex-grow flex items-center justify-center p-6 relative overflow-hidden">
        {/* Subtle background decorative blobs */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

        <div className="card w-full max-w-[400px] bg-white shadow-2xl shadow-blue-100/50 rounded-[2.5rem] p-10 border border-white/50 relative z-10">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Welcome Back!</h1>
            <p className="text-slate-500 text-sm font-medium">Please enter your details to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 text-xs font-medium rounded-r-lg animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-bold text-slate-600 text-xs uppercase tracking-wider">Email Address</span>
              </label>
              <input 
                type="email" 
                name="email"
                placeholder="name@company.com" 
                className="input input-bordered w-full h-12 rounded-2xl bg-slate-50 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-sm outline-none" 
                onChange={handleChange}
              />
            </div>

            {/* Password Field */}
            <div className="form-control">
              <div className="flex justify-between items-center px-1">
                <label className="label py-1">
                  <span className="label-text font-bold text-slate-600 text-xs uppercase tracking-wider">Password</span>
                </label>
                <a href="#" className="text-[11px] font-bold text-blue-600 hover:underline">Forgot?</a>
              </div>
              <input 
                type="password" 
                name="password"
                placeholder="••••••••" 
                className="input input-bordered w-full h-12 rounded-2xl bg-slate-50 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-sm outline-none" 
                onChange={handleChange}
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 px-1">
                <input type="checkbox" className="checkbox checkbox-xs checkbox-primary rounded" />
                <span className="text-xs text-slate-500 font-medium">Remember this device</span>
            </div>

            {/* Login Button */}
            <button 
              type="submit" 
              disabled={loading}
              className={`btn w-full h-12 rounded-2xl border-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold tracking-widest shadow-lg shadow-blue-200 mt-4 ${loading ? 'loading' : ''}`}
            >
              {loading ? 'AUTHENTICATING...' : 'LOG IN'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400 font-medium">
              New to OpenLesson? <span onClick={() => navigate('/register')} className="text-blue-600 cursor-pointer font-bold hover:underline">Create an account</span>
            </p>
          </div>
        </div>
      </main>

      {/* --- DUMMY FOOTER --- */}
      <footer className="w-full bg-white border-t border-slate-100 px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">
          © 2026 OpenLesson Cloud v2.0
        </p>
        <div className="flex gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
            <a href="#" className="hover:text-slate-600">Privacy Policy</a>
            <a href="#" className="hover:text-slate-600">Terms of Service</a>
            <a href="#" className="hover:text-slate-600">Support</a>
        </div>
      </footer>
    </div>
  );
};

export default Login;