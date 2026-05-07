import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, CheckSquare, Calendar, Plus, Trash2, Edit3, X } from 'lucide-react';
import { taskAPI, projectAPI, usersAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeletons';
import toast from 'react-hot-toast';

const statusBadge = { TODO: 'badge-todo', IN_PROGRESS: 'badge-in-progress', DONE: 'badge-done' };
const priorityBadge = { HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' };
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function TasksPage() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: '', priority: '', search: '', projectId: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', assignedTo: '', dueDate: '', projectId: '' });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => taskAPI.getAll(Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))).then(r => r.data),
  });

  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: () => projectAPI.getAll().then(r => r.data) });
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: () => usersAPI.getAll().then(r => r.data), enabled: isAdmin });

  const saveMut = useMutation({
    mutationFn: (data) => editTask ? taskAPI.update(editTask.id, data) : taskAPI.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); toast.success(editTask ? 'Updated!' : 'Created!'); closeModal(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => taskAPI.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Deleted'); },
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => taskAPI.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const closeModal = () => { setShowModal(false); setEditTask(null); setForm({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', assignedTo: '', dueDate: '', projectId: '' }); };

  const openEdit = (t) => {
    setEditTask(t);
    setForm({ title: t.title, description: t.description || '', priority: t.priority, status: t.status, assignedTo: t.assignedTo || '', dueDate: t.dueDate ? t.dueDate.split('T')[0] : '', projectId: t.projectId });
    setShowModal(true);
  };

  const activeFilters = Object.values(filters).filter(Boolean).length;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white tracking-tight">Tasks</h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">{tasks?.length || 0} tasks total</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 flex-1 sm:justify-end">
          <div className="relative group sm:w-72">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-brand-500 transition-colors" />
            <input 
              value={filters.search} 
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} 
              placeholder="Search tasks..." 
              className="bg-white dark:bg-surface-900 border-none rounded-2xl py-3 pl-12 pr-4 text-sm w-full focus:ring-2 focus:ring-brand-500/20 shadow-sm"
            />
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)} 
              className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${
                showFilters || activeFilters > 0 
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25' 
                  : 'bg-white dark:bg-surface-900 text-surface-500 shadow-sm'
              }`}
            >
              <Filter size={20} />
            </button>
            {isAdmin && (
              <button 
                onClick={() => { setForm({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', assignedTo: '', dueDate: '', projectId: '' }); setShowModal(true); }} 
                className="btn-primary"
              >
                <Plus size={18} /> New Task
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="overflow-hidden"
          >
            <div className="card p-6 flex flex-wrap gap-4 items-center mb-8">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-2 ml-1">Status</label>
                <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="input-field appearance-none">
                  <option value="">All Status</option><option value="TODO">To Do</option><option value="IN_PROGRESS">In Progress</option><option value="DONE">Done</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-2 ml-1">Priority</label>
                <select value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))} className="input-field appearance-none">
                  <option value="">All Priority</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-2 ml-1">Project</label>
                <select value={filters.projectId} onChange={e => setFilters(f => ({ ...f, projectId: e.target.value }))} className="input-field appearance-none">
                  <option value="">All Projects</option>
                  {(projects || []).map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              {activeFilters > 0 && (
                <div className="pt-6">
                  <button onClick={() => setFilters({ status: '', priority: '', search: '', projectId: '' })} className="text-xs font-bold text-red-500 hover:text-red-600 px-4 py-2 flex items-center gap-2">
                    <X size={14} /> Reset
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? <TableSkeleton rows={8} /> : (tasks || []).length === 0 ? (
        <EmptyState icon={CheckSquare} title="No tasks found" description="Try adjusting your filters or create a new task" />
      ) : (
        <motion.div variants={item} className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-50/50 dark:bg-white/5 border-b border-surface-50 dark:border-white/5">
                  <th className="text-left text-[10px] font-bold text-surface-400 uppercase tracking-widest px-6 py-5">Task Name</th>
                  <th className="text-left text-[10px] font-bold text-surface-400 uppercase tracking-widest px-6 py-5 hidden md:table-cell">Project</th>
                  <th className="text-left text-[10px] font-bold text-surface-400 uppercase tracking-widest px-6 py-5">Status</th>
                  <th className="text-left text-[10px] font-bold text-surface-400 uppercase tracking-widest px-6 py-5 hidden sm:table-cell">Priority</th>
                  <th className="text-left text-[10px] font-bold text-surface-400 uppercase tracking-widest px-6 py-5 hidden lg:table-cell">Assignee</th>
                  <th className="text-left text-[10px] font-bold text-surface-400 uppercase tracking-widest px-6 py-5 hidden lg:table-cell">Due Date</th>
                  <th className="px-6 py-5 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id} className="border-b border-surface-50 dark:border-white/5 hover:bg-brand-500/[0.01] transition-colors group">
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-surface-900 dark:text-white group-hover:text-brand-500 transition-colors tracking-tight">{task.title}</p>
                      {task.description && <p className="text-xs text-surface-400 truncate max-w-xs mt-1 font-medium">{task.description}</p>}
                    </td>
                    <td className="px-6 py-5 hidden md:table-cell">
                      <span className="text-xs font-bold text-surface-500 dark:text-surface-400">{task.project?.title}</span>
                    </td>
                    <td className="px-6 py-5">
                      <select 
                        value={task.status} 
                        onChange={e => statusMut.mutate({ id: task.id, status: e.target.value })} 
                        className={`badge cursor-pointer appearance-none ${statusBadge[task.status]}`}
                      >
                        <option value="TODO">TODO</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="DONE">DONE</option>
                      </select>
                    </td>
                    <td className="px-6 py-5 hidden sm:table-cell">
                      <span className={`badge ${priorityBadge[task.priority]}`}>{task.priority}</span>
                    </td>
                    <td className="px-6 py-5 hidden lg:table-cell">
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-brand-400 flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
                            {task.assignee.name.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-surface-600 dark:text-surface-300">{task.assignee.name}</span>
                        </div>
                      ) : <span className="text-xs font-bold text-surface-300">Unassigned</span>}
                    </td>
                    <td className="px-6 py-5 hidden lg:table-cell">
                      {task.dueDate ? (
                        <span className={`text-xs font-bold flex items-center gap-2 ${new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'text-red-500' : 'text-surface-400'}`}>
                          <Calendar size={14} className={new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'text-red-500' : 'text-brand-500'} />
                          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      ) : <span className="text-xs font-bold text-surface-300">—</span>}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        {isAdmin && (
                          <>
                            <button onClick={() => openEdit(task)} className="p-2 rounded-xl text-surface-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"><Edit3 size={16} /></button>
                            <button onClick={() => { if(confirm('Delete?')) deleteMut.mutate(task.id); }} className="p-2 rounded-xl text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"><Trash2 size={16} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Modal Section */}
      <Modal isOpen={showModal} onClose={closeModal} title={editTask ? 'Edit Task' : 'Create New Task'}>
        <form onSubmit={e => { e.preventDefault(); saveMut.mutate(form); }} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-surface-900 dark:text-white mb-2">Task Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" placeholder="What needs to be done?" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-surface-900 dark:text-white mb-2">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="input-field resize-none" placeholder="Add more context..." />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!editTask && (
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-surface-900 dark:text-white mb-2">Project</label>
                <select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))} className="input-field appearance-none" required>
                  <option value="">Select project</option>
                  {(projects || []).map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-surface-900 dark:text-white mb-2">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-field appearance-none">
                <option value="TODO">To Do</option><option value="IN_PROGRESS">In Progress</option><option value="DONE">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-surface-900 dark:text-white mb-2">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="input-field appearance-none">
                <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-surface-900 dark:text-white mb-2">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-bold text-surface-900 dark:text-white mb-2">Assign To</label>
              <select value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} className="input-field appearance-none">
                <option value="">Unassigned</option>
                {(users || []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saveMut.isPending} className="btn-primary flex-1">
              {saveMut.isPending ? 'Saving...' : editTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
