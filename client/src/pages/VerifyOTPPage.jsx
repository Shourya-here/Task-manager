import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'OTP must be exactly 6 digits'),
});

export default function VerifyOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, resendOTP } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast.error('No email found. Please sign up again.');
      navigate('/signup');
    }
  }, [email, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(otpSchema),
  });

  const onVerify = async (data) => {
    setIsLoading(true);
    try {
      await verifyOTP({ email, otp: data.otp });
      toast.success('Email verified successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendOTP(email);
      toast.success('A new code has been sent to your email.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-surface-950 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md bg-white dark:bg-surface-900 rounded-2xl shadow-2xl p-8 sm:p-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-brand-100 dark:bg-brand-500/20 rounded-2xl flex items-center justify-center mb-4">
            <ShieldCheck size={32} className="text-brand-600 dark:text-brand-400" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Verify Your Email</h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm text-center mt-2">
            We've sent a 6-digit code to <span className="font-semibold text-brand-600 dark:text-brand-400">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(onVerify)} className="space-y-6">
          <div>
            <label htmlFor="otp" className="block text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2 ml-1">
              Verification Code
            </label>
            <input 
              {...register('otp')} 
              id="otp"
              placeholder="000000" 
              maxLength={6}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
              }}
              className="w-full border border-surface-200 dark:border-surface-700 rounded-xl px-5 py-4 text-2xl font-bold tracking-[1em] text-center bg-transparent text-surface-900 dark:text-white placeholder-surface-300 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all" 
            />
            {errors.otp && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.otp.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isLoading || isResending} 
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl px-8 py-4 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Verify Code'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-surface-100 dark:border-surface-800 flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm text-surface-500 dark:text-surface-400">
              Didn't receive the code?
            </p>
            <button 
              onClick={handleResend}
              disabled={isResending || isLoading}
              className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors disabled:opacity-50"
            >
              {isResending ? 'Sending...' : 'Resend New Code'}
            </button>
          </div>
          
          <Link 
            to="/signup" 
            className="flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline mt-2"
          >
            <ArrowLeft size={16} />
            Back to Sign Up
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
