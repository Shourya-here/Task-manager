import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Users, CheckSquare, Trash2, UserPlus, UserMinus, Calendar, Edit3 } from 'lucide-react';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { projectAPI, usersAPI, taskAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeletons';
import toast from 'react-hot-toast';

const statusBadge = { TODO: 'badge-todo', IN_PROGRESS: 'badge-in-progress', DONE: 'badge-done' };
const priorityBadge = { HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' };

// Sortable Task Component
function SortableTask({ task, isAdmin, onDelete, onEdit, onStatusChange }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, data: { ...task } });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className="p-5 rounded-2xl bg-white dark:bg-surface-800/50 border border-transparent hover:border-brand-500/20 hover:shadow-xl hover:shadow-brand-500/5 transition-all group cursor-grab active:cursor-grabbing mb-4"
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-bold text-surface-900 dark:text-white flex-1 leading-tight">{task.title}</h4>
        {isAdmin && (
          <button onPointerDown={(e) => e.stopPropagation()} onClick={() => { if(confirm('Delete?')) onDelete(task.id); }} className="p-1.5 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
        )}
      </div>
      {task.description && <p className="text-xs text-surface-500 dark:text-surface-400 mb-4 line-clamp-2 leading-relaxed">{task.description}</p>}
      <div className="flex items-center justify-between gap-2 flex-wrap pt-4 border-t border-surface-50 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span className={`badge ${priorityBadge[task.priority]}`}>{task.priority}</span>
          {task.dueDate && <span className="text-[10px] font-bold text-surface-400 flex items-center gap-1"><Calendar size={12} />{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
        </div>
        {task.assignee && (
          <div className="w-6 h-6 rounded-lg bg-brand-500 flex items-center justify-center text-[10px] text-white font-bold shadow-sm" title={task.assignee.name}>
            {task.assignee.name.charAt(0)}
          </div>
        )}
      </div>
    </div>
  );
}

// Column Component
function KanbanColumn({ status, tasks, isAdmin, onDelete, onEdit, onStatusChange }) {
  const statusColors = {
    TODO: 'bg-brand-500',
    IN_PROGRESS: 'bg-amber-500',
    DONE: 'bg-emerald-500'
  };

  return (
    <div className="card p-6 h-full min-h-[600px] flex flex-col bg-surface-50/50 dark:bg-surface-900/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
          <h3 className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-widest">{status.replace('_', ' ')}</h3>
          <span className="w-6 h-6 rounded-lg bg-white dark:bg-surface-800 flex items-center justify-center text-[11px] font-bold text-surface-500 shadow-sm">{tasks.length}</span>
        </div>
        <button className="text-surface-400 hover:text-brand-500"><Plus size={18} /></button>
      </div>
      <SortableContext items={tasks.map(t => t.id)}>
        <div className="flex-1">
          {tasks.map(task => (
            <SortableTask key={task.id} task={task} isAdmin={isAdmin} onDelete={onDelete} onEdit={onEdit} onStatusChange={onStatusChange} />
          ))}
          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-surface-200 dark:border-surface-800 rounded-3xl">
              <p className="text-xs font-bold text-surface-400">No tasks here</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  
  // Initialize Socket.IO connection for this project
  useSocket(id);

  const [showAddMember, setShowAddMember] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', assignedTo: '', dueDate: '' });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectAPI.getById(id).then(r => r.data),
  });

  const { data: allUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersAPI.getAll().then(r => r.data),
    enabled: isAdmin,
  });

  const addMemberMut = useMutation({
    mutationFn: (userId) => projectAPI.addMember(id, userId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['project', id] }); toast.success('Member added!'); setShowAddMember(false); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const removeMemberMut = useMutation({
    mutationFn: (userId) => projectAPI.removeMember(id, userId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['project', id] }); toast.success('Member removed'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const createTaskMut = useMutation({
    mutationFn: (data) => taskAPI.create({ ...data, projectId: id }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['project', id] }); toast.success('Task created!'); setShowTaskModal(false); setTaskForm({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', assignedTo: '', dueDate: '' }); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const deleteTaskMut = useMutation({
    mutationFn: (taskId) => taskAPI.delete(taskId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['project', id] }); toast.success('Task deleted'); },
  });

  const updateTaskMut = useMutation({
    mutationFn: ({ taskId, data }) => taskAPI.update(taskId, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['project', id] }); },
  });

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>;
  if (!project) return <EmptyState title="Project not found" />;

  const memberIds = (project.members || []).map(m => m.userId);
  const nonMembers = (allUsers || []).filter(u => !memberIds.includes(u.id));

  const tasksByStatus = { TODO: [], IN_PROGRESS: [], DONE: [] };
  (project.tasks || []).forEach(t => { if (tasksByStatus[t.status]) tasksByStatus[t.status].push(t); });

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = project.tasks.find(t => t.id === active.id);
    const overId = over.id;
    
    // Find what status column we dropped into
    let newStatus = null;
    const overTask = project.tasks.find(t => t.id === overId);
    if (overTask) {
      newStatus = overTask.status;
    }

    if (newStatus && activeTask.status !== newStatus) {
      queryClient.setQueryData(['project', id], (old) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.map(t => t.id === activeTask.id ? { ...t, status: newStatus } : t)
        };
      });
      updateTaskMut.mutate({ taskId: activeTask.id, data: { status: newStatus } });
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <button onClick={() => navigate('/projects')} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-surface-900 rounded-2xl shadow-sm text-surface-500 hover:text-brand-500 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">{project.title}</h1>
          <div className="flex items-center gap-4 mt-1">
             <span className="text-xs font-bold text-surface-400 flex items-center gap-1.5"><Calendar size={14} className="text-brand-500" /> Created {new Date(project.createdAt).toLocaleDateString()}</span>
             <span className="text-xs font-bold text-surface-400 flex items-center gap-1.5"><Users size={14} className="text-brand-500" /> {project.members?.length || 0} Members</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3 mr-2">
            {(project.members || []).slice(0, 5).map(m => (
              <div key={m.id} className="w-9 h-9 rounded-xl bg-brand-500 border-4 border-surface-50 dark:border-surface-950 flex items-center justify-center text-white text-xs font-bold shadow-lg" title={m.user.name}>
                {m.user.name.charAt(0)}
              </div>
            ))}
            {(project.members || []).length > 5 && (
              <div className="w-9 h-9 rounded-xl bg-surface-200 dark:bg-surface-800 border-4 border-surface-50 dark:border-surface-950 flex items-center justify-center text-surface-600 text-xs font-bold shadow-lg">
                +{(project.members || []).length - 5}
              </div>
            )}
          </div>
          {isAdmin && (
            <button onClick={() => setShowAddMember(true)} className="w-11 h-11 flex items-center justify-center bg-white dark:bg-surface-900 rounded-2xl shadow-sm text-surface-400 hover:text-brand-500 transition-colors">
              <UserPlus size={20} />
            </button>
          )}
          {isAdmin && <button onClick={() => setShowTaskModal(true)} className="btn-primary"><Plus size={20} /> Add Task</button>}
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(['TODO', 'IN_PROGRESS', 'DONE']).map(status => (
            <KanbanColumn 
              key={status} 
              status={status} 
              tasks={tasksByStatus[status]} 
              isAdmin={isAdmin}
              onDelete={(taskId) => deleteTaskMut.mutate(taskId)}
              onStatusChange={(taskId, newStatus) => updateTaskMut.mutate({ taskId, data: { status: newStatus } })}
            />
          ))}
        </div>
      </DndContext>

      {/* Add Member Modal */}
      <Modal isOpen={showAddMember} onClose={() => setShowAddMember(false)} title="Add Team Member">
        <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin pr-2">
          {nonMembers.length === 0 ? <p className="text-sm text-surface-500 py-8 text-center font-bold">Everyone is already in the team!</p> : nonMembers.map(u => (
            <button key={u.id} onClick={() => addMemberMut.mutate(u.id)} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-surface-50 dark:hover:bg-brand-500/5 transition-all text-left border border-transparent hover:border-brand-500/10 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-brand-400 flex items-center justify-center text-white text-sm font-bold shadow-lg group-hover:scale-110 transition-transform">{u.name.charAt(0)}</div>
              <div className="flex-1">
                <p className="text-sm font-bold text-surface-900 dark:text-white">{u.name}</p>
                <p className="text-xs font-medium text-surface-400">{u.email}</p>
              </div>
              <span className="badge badge-todo">{u.role}</span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Create Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create Task">
        <form onSubmit={(e) => { e.preventDefault(); createTaskMut.mutate(taskForm); }} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-surface-900 dark:text-white mb-2">Task Title</label>
            <input value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} className="input-field" placeholder="What needs to be done?" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-surface-900 dark:text-white mb-2">Description</label>
            <textarea value={taskForm.description} onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))} rows={3} className="input-field resize-none" placeholder="Add more details..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-surface-900 dark:text-white mb-2">Priority</label>
              <select value={taskForm.priority} onChange={e => setTaskForm(f => ({ ...f, priority: e.target.value }))} className="input-field appearance-none bg-no-repeat bg-right pr-10">
                <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-surface-900 dark:text-white mb-2">Due Date</label>
              <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm(f => ({ ...f, dueDate: e.target.value }))} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-surface-900 dark:text-white mb-2">Assign To</label>
            <select value={taskForm.assignedTo} onChange={e => setTaskForm(f => ({ ...f, assignedTo: e.target.value }))} className="input-field appearance-none">
              <option value="">Unassigned</option>
              {(project.members || []).map(m => <option key={m.userId} value={m.userId}>{m.user.name}</option>)}
            </select>
          </div>
          <div className="flex gap-4 pt-2">
            <button type="button" onClick={() => setShowTaskModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={createTaskMut.isPending} className="btn-primary flex-1">{createTaskMut.isPending ? 'Creating...' : 'Create Task'}</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
