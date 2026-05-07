import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Compass, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: 'MEMBER' },
  });

  const onSignup = async (data) => {
    setIsLoading(true);
    try {
      const response = await signup(data);
      toast.success(response.message || 'Account created! Please verify your email.');
      navigate('/verify-otp', { state: { email: data.email } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
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
        className="w-full max-w-4xl bg-white dark:bg-surface-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[520px]"
      >
        {/* Left Panel — Brand */}
        <div className="md:w-5/12 bg-brand-600 relative flex flex-col justify-end p-8 sm:p-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-700/50 to-brand-600" />
          
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
              Join<br className="hidden md:block" /> Venture
            </h2>
            <p className="text-brand-100/70 text-sm leading-relaxed max-w-xs">
              Create your account and start<br />
              managing strategic projects with<br />
              your team today.
            </p>
          </div>
        </div>

        {/* Right Panel — Form */}
        <div className="md:w-7/12 flex flex-col justify-center p-8 sm:p-10 md:p-12 lg:p-16">
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-800 dark:text-white mb-8">Create Account</h1>

          <form onSubmit={handleSubmit(onSignup)} className="space-y-4">
            <div>
              <input 
                {...register('name')} 
                placeholder="Full Name" 
                autoComplete="name"
                className="w-full border border-surface-200 dark:border-surface-700 rounded-full px-5 py-3 text-sm bg-transparent text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all" 
              />
              {errors.name && <p className="text-red-500 text-xs mt-1.5 ml-5">{errors.name.message}</p>}
            </div>

            <div>
              <input 
                {...register('email')} 
                type="email" 
                placeholder="Work Email" 
                autoComplete="email"
                className="w-full border border-surface-200 dark:border-surface-700 rounded-full px-5 py-3 text-sm bg-transparent text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all" 
              />
              {errors.email && <p className="text-red-500 text-xs mt-1.5 ml-5">{errors.email.message}</p>}
            </div>

            <div className="relative">
              <input 
                {...register('password')} 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Password (min 6 characters)" 
                autoComplete="new-password"
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
                  'Sign up'
                )}
              </button>
              <Link 
                to="/login" 
                className="border border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400 text-sm font-semibold rounded-full px-8 py-3 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all text-center min-w-[120px]"
              >
                Login
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
