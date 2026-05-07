import prisma from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { getIO } from '../config/socket.js';
import { sendTaskAssignmentEmail } from './email.service.js';

export const createTask = async (data, createdBy) => {
  const project = await prisma.project.findUnique({ where: { id: data.projectId } });
  if (!project) throw new AppError('Project not found', 404);

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status || 'TODO',
      priority: data.priority || 'MEDIUM',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      assignedTo: data.assignedTo || null,
      projectId: data.projectId,
      createdBy,
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, title: true } },
      creator: { select: { id: true, name: true } },
    },
  });

  getIO().to(`project_${task.projectId}`).emit('taskCreated', task);

  if (task.assignee) {
    sendTaskAssignmentEmail(task.assignee.email, task.assignee.name, task.title, task.project.title);
  }

  return task;
};

export const getTasks = async (user, query = {}) => {
  const where = {};

  if (user.role === 'MEMBER') {
    where.assignedTo = user.id;
  }

  if (query.projectId) where.projectId = query.projectId;
  if (query.status) where.status = query.status;
  if (query.priority) where.priority = query.priority;
  if (query.assignedTo) where.assignedTo = query.assignedTo;
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  return prisma.task.findMany({
    where,
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, title: true } },
      creator: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getTaskById = async (id, user) => {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, title: true } },
      creator: { select: { id: true, name: true } },
    },
  });

  if (!task) throw new AppError('Task not found', 404);

  if (user.role === 'MEMBER' && task.assignedTo !== user.id) {
    throw new AppError('Access denied', 403);
  }

  return task;
};

export const updateTask = async (id, data, user) => {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw new AppError('Task not found', 404);

  // Members can only update status
  if (user.role === 'MEMBER') {
    if (task.assignedTo !== user.id) {
      throw new AppError('Access denied', 403);
    }
    // Only allow status update for members
    const updateData = {};
    if (data.status) updateData.status = data.status;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, title: true } },
        creator: { select: { id: true, name: true } },
      },
    });
    
    getIO().to(`project_${updatedTask.projectId}`).emit('taskUpdated', updatedTask);
    return updatedTask;
  }

  // Admin can update everything
  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo || null;

  const updatedTask = await prisma.task.update({
    where: { id },
    data: updateData,
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, title: true } },
      creator: { select: { id: true, name: true } },
    },
  });

  getIO().to(`project_${updatedTask.projectId}`).emit('taskUpdated', updatedTask);
  return updatedTask;
};

export const deleteTask = async (id) => {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw new AppError('Task not found', 404);
  await prisma.task.delete({ where: { id } });

  getIO().to(`project_${task.projectId}`).emit('taskDeleted', { taskId: id, projectId: task.projectId });
};
