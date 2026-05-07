import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Plus, FolderKanban, Users, CheckSquare, Trash2, Edit3, Search } from 'lucide-react';
import { projectAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeletons';
import toast from 'react-hot-toast';

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function ProjectsPage() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [search, setSearch] = useState('');

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectAPI.getAll().then((r) => r.data),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(projectSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data) => editProject ? projectAPI.update(editProject.id, data) : projectAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(editProject ? 'Project updated!' : 'Project created!');
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => projectAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const closeModal = () => { setShowModal(false); setEditProject(null); reset({ title: '', description: '' }); };
  const openEdit = (p) => { setEditProject(p); reset({ title: p.title, description: p.description || '' }); setShowModal(true); };

  const filtered = (projects || []).filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white tracking-tight">Projects</h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">{projects?.length || 0} active projects</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 flex-1 sm:justify-end">
          <div className="relative group sm:w-72">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-brand-500 transition-colors" />
            <input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search projects..." 
              className="bg-white dark:bg-surface-900 border-none rounded-2xl py-3 pl-12 pr-4 text-sm w-full focus:ring-2 focus:ring-brand-500/20 shadow-sm"
            />
          </div>
          {isAdmin && (
            <button onClick={() => { reset({ title: '', description: '' }); setShowModal(true); }} className="btn-primary">
              <Plus size={18} /> New Project
            </button>
          )}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects found" description={search ? 'Try a different search term' : 'Create your first project to get started'} action={isAdmin && !search && <button onClick={() => setShowModal(true)} className="btn-primary"><Plus size={16} /> Create Project</button>} />
      ) : (
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <motion.div 
              key={project.id} 
              whileHover={{ y: -4 }} 
              className="card p-6 flex flex-col group hover:bg-brand-500/[0.01] transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-[1.25rem] bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FolderKanban size={22} className="text-brand-500" />
                </div>
                {isAdmin && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(project)} className="p-2 rounded-xl text-surface-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10"><Edit3 size={16} /></button>
                    <button onClick={() => { if (confirm('Delete project?')) deleteMutation.mutate(project.id); }} className="p-2 rounded-xl text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 size={16} /></button>
                  </div>
                )}
              </div>
              
              <Link to={`/projects/${project.id}`} className="mb-2">
                <h3 className="text-lg font-bold text-surface-900 dark:text-white truncate group-hover:text-brand-500 transition-colors tracking-tight">{project.title}</h3>
              </Link>
              
              <p className="text-sm text-surface-500 dark:text-surface-400 mb-6 line-clamp-2 flex-1 leading-relaxed">{project.description || 'No description provided for this project.'}</p>
              
              <div className="flex items-center justify-between pt-5 border-t border-surface-50 dark:border-white/5">
                <div className="flex -space-x-2">
                  {project.members?.slice(0, 3).map((m, i) => (
                    <div key={m.userId} className="w-7 h-7 rounded-lg bg-surface-100 dark:bg-surface-800 border-2 border-white dark:border-surface-900 flex items-center justify-center text-[10px] font-bold text-surface-600 dark:text-surface-300">
                      {m.user?.name.charAt(0)}
                    </div>
                  ))}
                  {project.members?.length > 3 && (
                    <div className="w-7 h-7 rounded-lg bg-surface-100 dark:bg-surface-800 border-2 border-white dark:border-surface-900 flex items-center justify-center text-[10px] font-bold text-surface-500">
                      +{project.members.length - 3}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-surface-400">
                  <span className="flex items-center gap-1.5"><CheckSquare size={14} className="text-brand-500" /> {project._count?.tasks || 0}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Modal isOpen={showModal} onClose={closeModal} title={editProject ? 'Edit Project' : 'Create New Project'}>
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-surface-900 dark:text-white mb-2">Project Title</label>
            <input {...register('title')} className="input-field" placeholder="e.g. Marketing Campaign" />
            {errors.title && <p className="text-red-500 text-xs mt-2 font-medium">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-surface-900 dark:text-white mb-2">Description</label>
            <textarea {...register('description')} rows={4} className="input-field resize-none" placeholder="What is this project about?" />
          </div>
          <div className="flex gap-4 pt-2">
            <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1">
              {createMutation.isPending ? 'Saving...' : editProject ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
