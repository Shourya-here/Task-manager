import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-surface-950 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white dark:bg-surface-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[480px]"
      >
        {/* Left Panel — Brand */}
        <div className="md:w-5/12 bg-brand-600 relative flex flex-col justify-end p-8 sm:p-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-700/50 to-brand-600" />
          
          {/* Center icon */}
          <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white dark:bg-surface-900 rounded-full shadow-xl flex items-center justify-center z-20 hidden md:flex">
            <Compass size={28} className="text-brand-600" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6 md:hidden">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Compass size={20} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white">Venture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-3">
              Venture<br className="hidden md:block" /> Management
            </h2>
            <p className="text-brand-100/70 text-sm leading-relaxed max-w-xs">
              Streamline your strategic projects,<br />
              manage tasks efficiently,<br />
              and collaborate with your team.
            </p>
          </div>
        </div>

        {/* Right Panel — Form */}
        <div className="md:w-7/12 flex flex-col justify-center p-8 sm:p-10 md:p-12 lg:p-16">
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-800 dark:text-white mb-8">Welcome Aboard</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <input 
                {...register('email')} 
                type="email" 
                placeholder="Email" 
                autoComplete="email"
                className="w-full border border-surface-200 dark:border-surface-700 rounded-full px-5 py-3 text-sm bg-transparent text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all" 
              />
              {errors.email && <p className="text-red-500 text-xs mt-1.5 ml-5">{errors.email.message}</p>}
            </div>

            <div className="relative">
              <input 
                {...register('password')} 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Password" 
                autoComplete="current-password"
                className="w-full border border-surface-200 dark:border-surface-700 rounded-full px-5 py-3 text-sm bg-transparent text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all pr-12" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-brand-500 transition-colors p-1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {errors.password && <p className="text-red-500 text-xs mt-1.5 ml-5">{errors.password.message}</p>}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
              <button 
                type="submit" 
                disabled={isLoading} 
                className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-full px-8 py-3 transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center min-w-[120px]"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Login'
                )}
              </button>
              <Link 
                to="/signup" 
                className="border border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400 text-sm font-semibold rounded-full px-8 py-3 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all text-center min-w-[120px]"
              >
                Sign up
              </Link>
            </div>
          </form>

          {/* Demo toggle */}
          <div className="mt-8 flex flex-col items-start">
            <button 
              onClick={() => setShowDemo(!showDemo)} 
              className="text-[11px] font-semibold text-surface-400 hover:text-brand-500 transition-colors"
            >
              {showDemo ? 'Hide' : 'Show'} Demo Credentials
            </button>
            
            <AnimatePresence>
              {showDemo && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }}
                  className="w-full overflow-hidden"
                >
                  <div className="mt-3 text-xs text-surface-500 dark:text-surface-400 space-y-1">
                    <p><span className="font-bold text-brand-600 dark:text-brand-400">Admin:</span> admin@venture.com / admin123</p>
                    <p><span className="font-bold text-brand-600 dark:text-brand-400">Member:</span> arjun@venture.com / member123</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
