import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { 
  CheckCircle2, Clock, AlertTriangle, FolderKanban, Users, ListTodo, 
  Search, Bell, Settings, Plus, Calendar, MoreHorizontal, User,
  TrendingUp, ArrowUpRight, Moon, Sun
} from 'lucide-react';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { DashboardSkeleton } from '../components/ui/Skeletons';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const activityStats = [
  { day: 'Mon', tasks: 12 },
  { day: 'Tue', tasks: 19 },
  { day: 'Wed', tasks: 15 },
  { day: 'Thu', tasks: 22 },
  { day: 'Fri', tasks: 30 },
  { day: 'Sat', tasks: 10 },
  { day: 'Sun', tasks: 8 },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardAPI.getStats().then((r) => r.data),
  });

  const { data: overdueTasks } = useQuery({
    queryKey: ['overdue-tasks'],
    queryFn: () => dashboardAPI.getOverdue().then((r) => r.data),
  });

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-full pb-10">
      <div className="flex-1 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white tracking-tight">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-brand-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-white dark:bg-surface-900 border-none rounded-2xl py-2.5 pl-12 pr-4 text-sm w-full sm:w-64 focus:ring-2 focus:ring-brand-500/20 shadow-sm"
              />
            </div>
            <button 
              onClick={toggleDarkMode}
              className="w-11 h-11 flex items-center justify-center bg-white dark:bg-surface-900 rounded-2xl shadow-sm text-surface-500 hover:text-brand-500 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="w-11 h-11 flex items-center justify-center bg-white dark:bg-surface-900 rounded-2xl shadow-sm text-surface-500 hover:text-brand-500 transition-colors">
              <Bell size={20} />
            </button>
          </div>
        </div>

        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
          <motion.div variants={item} className="relative overflow-hidden p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] bg-gradient-to-br from-brand-500/5 via-brand-500/10 to-transparent border border-brand-500/10">
            <div className="relative z-10 max-w-lg">
              <p className="text-brand-600 dark:text-brand-400 font-bold text-xs sm:text-sm mb-1 sm:mb-2">Good morning, {user?.name?.split(' ')[0]}</p>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-surface-900 dark:text-white mb-3 sm:mb-4 leading-tight">
                Check your daily task & Schedules
              </h2>
              <p className="text-surface-500 dark:text-surface-400 text-xs sm:text-sm mb-4 sm:mb-6">Have a good day and stay productive!</p>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <button onClick={() => navigate('/tasks')} className="btn-primary text-xs sm:text-sm px-4 sm:px-6 py-2.5 sm:py-3">View Schedule</button>
                <button onClick={() => navigate('/projects')} className="btn-secondary text-xs sm:text-sm px-4 sm:px-6 py-2.5 sm:py-3">New Project</button>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-1/3 h-full hidden md:block">
               <div className="absolute top-1/2 right-10 -translate-y-1/2 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl" />
               <div className="absolute top-1/4 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl" />
            </div>
          </motion.div>

          <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Projects', value: stats?.totalProjects || 0, icon: FolderKanban, color: 'text-violet-500', bg: 'bg-violet-500/10' },
              { label: 'Tasks', value: stats?.totalTasks || 0, icon: ListTodo, color: 'text-brand-500', bg: 'bg-brand-500/10' },
              { label: 'Team', value: stats?.totalMembers || 0, icon: Users, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
              { label: 'Success', value: `${stats?.completionRate || 0}%`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            ].map((s) => (
              <div key={s.label} className="card p-5 group hover:bg-brand-500/[0.02] transition-colors">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <s.icon size={18} className={s.color} />
                </div>
                <p className="text-xs font-bold text-surface-400 mb-1">{s.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-xl font-extrabold text-surface-900 dark:text-white">{s.value}</p>
                  <ArrowUpRight size={14} className="text-surface-300" />
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card p-6">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-surface-900 dark:text-white tracking-tight">Activity</h3>
                <div className="flex gap-2">
                  {['Week', 'Month'].map(t => (
                    <button key={t} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${t === 'Week' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25' : 'text-surface-400 hover:bg-surface-50 dark:hover:bg-white/5'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="h-[200px] sm:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityStats}>
                    <defs>
                      <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#a78bfa', fontSize: 11, fontWeight: 600 }}
                      dy={10}
                    />
                    <Tooltip 
                      contentStyle={{ background: '#0b0a22', border: 'none', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                      itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="tasks" 
                      stroke="#6366f1" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorTasks)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-6 flex flex-col items-center justify-center">
               <h3 className="text-sm font-bold text-surface-400 mb-6 uppercase tracking-widest">Efficiency</h3>
               <div className="relative w-40 h-40">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-surface-100 dark:text-surface-800 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" />
                    <circle 
                      className="text-brand-500 stroke-current" 
                      strokeWidth="8" 
                      strokeLinecap="round" 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="transparent" 
                      strokeDasharray="251.2" 
                      strokeDashoffset={251.2 * (1 - (stats?.completionRate || 0) / 100)} 
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-surface-900 dark:text-white">{stats?.completionRate || 0}%</span>
                    <span className="text-[10px] font-bold text-surface-400">SUCCESSFUL</span>
                  </div>
               </div>
               <div className="mt-8 space-y-2 w-full">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-surface-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-brand-500" /> Completed</span>
                    <span className="text-surface-900 dark:text-white">{stats?.doneTasks || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-surface-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-surface-200 dark:bg-surface-800" /> In Progress</span>
                    <span className="text-surface-900 dark:text-white">{stats?.inProgressTasks || 0}</span>
                  </div>
               </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="w-full lg:w-[340px] space-y-6 sm:space-y-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-surface-900 dark:text-white">Profile</h3>
            <button className="text-surface-400 hover:text-brand-500"><MoreHorizontal size={20} /></button>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-brand-500/30">
                {user?.name?.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-white dark:bg-surface-800 flex items-center justify-center text-emerald-500 shadow-lg border-2 border-white dark:border-surface-900">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <h4 className="text-lg font-bold text-surface-900 dark:text-white">{user?.name}</h4>
            <p className="text-sm text-surface-500 font-medium">{user?.role}</p>
            <button onClick={() => navigate('/profile')} className="mt-6 w-full py-3 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 text-xs font-bold rounded-2xl hover:bg-brand-100 transition-colors">
              View Profile
            </button>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-surface-900 dark:text-white">My Tasks</h3>
            <span className="text-xs font-bold text-surface-400">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
          
          <div className="space-y-4">
            {overdueTasks?.slice(0, 3).map((task) => (
              <div key={task.id} className="group relative p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/50 hover:bg-white dark:hover:bg-surface-800 border border-transparent hover:border-brand-500/20 transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 w-2 h-2 rounded-full ${task.priority === 'HIGH' ? 'bg-red-500' : 'bg-brand-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-surface-900 dark:text-white truncate group-hover:text-brand-500 transition-colors">{task.title}</p>
                    <p className="text-[11px] text-surface-400 mt-1 font-medium">{task.project?.title}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                   <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-brand-500 flex items-center justify-center text-[10px] text-white font-bold border-2 border-white dark:border-surface-800">
                        {user?.name?.charAt(0)}
                      </div>
                   </div>
                   <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-lg">OVERDUE</span>
                </div>
              </div>
            ))}
            {(!overdueTasks || overdueTasks.length === 0) && (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={24} className="text-brand-500" />
                </div>
                <p className="text-sm font-bold text-surface-900 dark:text-white">All caught up!</p>
                <p className="text-xs text-surface-500 mt-1">No overdue tasks found.</p>
              </div>
            )}
          </div>

          <button onClick={() => navigate('/tasks')} className="mt-8 w-full py-4 border-2 border-dashed border-surface-200 dark:border-surface-800 rounded-2xl text-surface-400 hover:border-brand-500 hover:text-brand-500 transition-all flex items-center justify-center gap-2 text-sm font-bold">
            <Plus size={18} />
            Add New Task
          </button>
        </div>
      </div>
    </div>
  );
}
