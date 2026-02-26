import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Home, 
  Megaphone, 
  BookOpen, 
  User, 
  MessageSquare, 
  LogOut, 
  Camera,
  Save
} from 'lucide-react';

const Profile = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    gradeId: '',
    phone: '',
    password: '' // Optional for updates
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dummy logic for fetching data on load
  useEffect(() => {
    // In a real app, you'd fetch student data using the ID from localStorage/JWT
    // const studentId = localStorage.getItem('studentId');
    // axios.get(`/api/student/${studentId}`).then(res => setFormData(res.data));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'fullName') {
      setFormData({ ...formData, [name]: value.replace(/[0-9]/g, '') });
    } else if (name === 'phone') {
      setFormData({ ...formData, [name]: value.replace(/\D/g, '').slice(0, 10) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Using your backend route: router.put('/profile/:id', updateProfile);
      const studentId = localStorage.getItem('studentId') || 'current_id';
      const response = await axios.put(`http://localhost:5000/api/profile/${studentId}`, formData);
      alert("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      
      {/* --- SIDE BAR --- */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <BookOpen size={20} />
          </div>
          <span className="text-xl font-bold text-slate-800">OpenLesson</span>
        </div>

        <nav className="flex-grow px-4 space-y-2 mt-4">
          <NavItem icon={<Home size={18}/>} label="Home" />
          <NavItem icon={<Megaphone size={18}/>} label="Announcements" />
          <NavItem icon={<BookOpen size={18}/>} label="Courses" />
          <NavItem icon={<User size={18}/>} label="Profile" active />
          <NavItem icon={<MessageSquare size={18}/>} label="Reports" />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
            <LogOut size={18} />
            <span className="font-semibold text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-grow flex flex-col">
        
        {/* --- MINIMAL HEADER --- */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8">
          <h2 className="font-bold text-slate-700">Account Settings</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-500">Welcome, {formData.fullName || 'Student'}</span>
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200"></div>
          </div>
        </header>

        <main className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              
              {/* Profile Top Section */}
              <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
                <div className="absolute -bottom-12 left-10">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-3xl bg-white p-1 shadow-xl">
                      <div className="w-full h-full rounded-[1.2rem] bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                        <User size={48} />
                      </div>
                    </div>
                    <button className="absolute bottom-2 right-2 p-2 bg-white rounded-xl shadow-md text-blue-600 hover:bg-blue-50 transition-all border border-slate-100">
                      <Camera size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <div className="pt-20 px-10 pb-10">
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-slate-800">Personal Information</h3>
                  <p className="text-slate-500 text-sm">Update your personal details and account settings</p>
                </div>

                {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium">{error}</div>}

                <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" />
                  <FormInput label="Email Address" name="email" value={formData.email} onChange={handleChange} type="email" placeholder="john@example.com" />
                  
                  <div className="form-control w-full">
                    <label className="label py-1"><span className="label-text font-bold text-slate-600 text-xs uppercase tracking-wider">Current Grade</span></label>
                    <select 
                      name="gradeId" 
                      className="select select-bordered w-full h-12 rounded-2xl bg-slate-50 border-slate-200 focus:border-blue-400 focus:outline-none transition-all"
                      onChange={handleChange}
                      value={formData.gradeId}
                    >
                      <option value="" disabled>Select Grade</option>
                      <option value="650c...1">Grade 1-5</option>
                      <option value="650c...2">Grade 6-11</option>
                      <option value="650c...3">Grade 12-13</option>
                    </select>
                  </div>

                  <FormInput label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} placeholder="0712345678" />
                  
                  <div className="md:col-span-2 pt-4 border-t border-slate-50 mt-4 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="btn h-12 px-8 rounded-2xl border-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                    >
                      {loading ? 'Saving...' : <><Save size={18}/> Update Profile</>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>

        {/* --- MINIMAL FOOTER --- */}
        <footer className="mt-auto p-6 text-center text-xs text-slate-400 font-medium">
          © 2026 OpenLesson Student Portal • All data is encrypted and secure
        </footer>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const NavItem = ({ icon, label, active = false }) => (
  <button className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
    active ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
  }`}>
    {icon}
    {label}
  </button>
);

const FormInput = ({ label, type = "text", ...props }) => (
  <div className="form-control w-full">
    <label className="label py-1">
      <span className="label-text font-bold text-slate-600 text-xs uppercase tracking-wider">{label}</span>
    </label>
    <input 
      {...props}
      type={type}
      className="input input-bordered w-full h-12 rounded-2xl bg-slate-50 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-sm outline-none" 
    />
  </div>
);

export default Profile;