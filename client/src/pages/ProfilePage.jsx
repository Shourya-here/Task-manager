import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar, Moon, Sun } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export default function ProfilePage() {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">Account Settings</h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">Manage your profile information and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <div className="card p-8 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-brand-500/30 mb-6">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white tracking-tight">{user?.name}</h2>
            <p className="text-sm font-medium text-surface-500 mt-1">{user?.email}</p>
            <div className="mt-6">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                user?.role === 'ADMIN' 
                  ? 'bg-brand-500/10 text-brand-500' 
                  : 'bg-emerald-500/10 text-emerald-500'
              }`}>
                {user?.role}
              </span>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-6">Appearance</h3>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-50 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-brand-500/10 text-brand-400' : 'bg-amber-500/10 text-amber-500'}`}>
                  {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-surface-900 dark:text-white">Dark Mode</p>
                  <p className="text-[10px] font-bold text-surface-400 uppercase tracking-tight">{darkMode ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
              <button onClick={toggleDarkMode} className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-brand-600' : 'bg-surface-300'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-lg transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="md:col-span-2">
          <div className="card p-8">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-8 tracking-tight">Profile Details</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface-50 dark:bg-white/5 border border-transparent">
                    <User size={18} className="text-brand-500" />
                    <p className="text-sm font-bold text-surface-900 dark:text-white">{user?.name}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface-50 dark:bg-white/5 border border-transparent">
                    <Mail size={18} className="text-brand-500" />
                    <p className="text-sm font-bold text-surface-900 dark:text-white">{user?.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-400 uppercase tracking-widest ml-1">Account Role</label>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface-50 dark:bg-white/5 border border-transparent">
                    <Shield size={18} className="text-brand-500" />
                    <p className="text-sm font-bold text-surface-900 dark:text-white">{user?.role}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-400 uppercase tracking-widest ml-1">Member Since</label>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface-50 dark:bg-white/5 border border-transparent">
                    <Calendar size={18} className="text-brand-500" />
                    <p className="text-sm font-bold text-surface-900 dark:text-white">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-8 border-t border-surface-50 dark:border-white/5">
                <button className="btn-secondary w-full sm:w-auto px-8">Update Password</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
