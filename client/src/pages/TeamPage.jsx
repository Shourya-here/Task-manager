import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Shield, UserCircle, Mail, Calendar } from 'lucide-react';
import { usersAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeletons';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function TeamPage() {
  const { isAdmin } = useAuth();
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersAPI.getAll().then(r => r.data),
    enabled: isAdmin,
  });

  if (!isAdmin) return <EmptyState icon={Shield} title="Access Denied" description="Only admins can manage the team" />;

  const admins = (users || []).filter(u => u.role === 'ADMIN');
  const members = (users || []).filter(u => u.role === 'MEMBER');

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-10">
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white tracking-tight">Team Management</h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">{users?.length || 0} active members in your workspace</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 shadow-sm border border-brand-500/20">
            <Users size={20} />
          </div>
        </div>
      </motion.div>

      {isLoading ? <TableSkeleton rows={5} /> : (
        <div className="space-y-12">
          {/* Admins */}
          <motion.div variants={item}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-brand-500" />
              <h2 className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-widest flex items-center gap-2">Admins ({admins.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {admins.map(u => (
                <motion.div 
                  key={u.id} 
                  whileHover={{ y: -4 }}
                  className="card p-6 flex items-center gap-5 group hover:bg-brand-500/[0.01] transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white text-xl font-bold shadow-xl shadow-brand-500/20 group-hover:scale-110 transition-transform">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-surface-900 dark:text-white truncate tracking-tight">{u.name}</p>
                    <p className="text-xs font-medium text-surface-500 truncate flex items-center gap-2 mt-1"><Mail size={12} className="text-brand-500" />{u.email}</p>
                    <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-3">Admin access</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Shield size={16} className="text-brand-500" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Members */}
          <motion.div variants={item}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-widest flex items-center gap-2">Members ({members.length})</h2>
            </div>
            {members.length === 0 ? (
              <div className="card p-12 flex flex-col items-center justify-center border-2 border-dashed border-surface-200 dark:border-surface-800">
                <p className="text-sm font-bold text-surface-400">No members added yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.map(u => (
                  <motion.div 
                    key={u.id} 
                    whileHover={{ y: -4 }}
                    className="card p-6 flex items-center gap-5 group hover:bg-emerald-500/[0.01] transition-all duration-300"
                  >
                    <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white text-xl font-bold shadow-xl shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-surface-900 dark:text-white truncate tracking-tight">{u.name}</p>
                      <p className="text-xs font-medium text-surface-500 truncate flex items-center gap-2 mt-1"><Mail size={12} className="text-emerald-500" />{u.email}</p>
                      <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-3 flex items-center gap-1.5"><Calendar size={12} /> Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
