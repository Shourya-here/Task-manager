import prisma from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { sendProjectInvitationEmail } from './email.service.js';

export const createProject = async ({ title, description, createdBy }) => {
  const project = await prisma.project.create({
    data: {
      title,
      description,
      createdBy,
      members: { create: { userId: createdBy } },
    },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
      _count: { select: { tasks: true } },
    },
  });
  return project;
};

export const getProjects = async (user) => {
  if (user.role === 'ADMIN') {
    return prisma.project.findMany({
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  return prisma.project.findMany({
    where: { members: { some: { userId: user.id } } },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getProjectById = async (id, user) => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
      tasks: {
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          creator: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  if (user.role !== 'ADMIN') {
    const isMember = project.members.some((m) => m.userId === user.id);
    if (!isMember) {
      throw new AppError('Access denied. You are not a member of this project.', 403);
    }
  }

  return project;
};

export const updateProject = async (id, data) => {
  const project = await prisma.project.update({
    where: { id },
    data: { title: data.title, description: data.description },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
      _count: { select: { tasks: true } },
    },
  });
  return project;
};

export const deleteProject = async (id) => {
  await prisma.project.delete({ where: { id } });
};

export const addMember = async (projectId, userId) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new AppError('Project not found', 404);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (existing) throw new AppError('User is already a member of this project', 409);

  const member = await prisma.projectMember.create({
    data: { projectId, userId },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });

  await sendProjectInvitationEmail(user.email, user.name, project.title);

  return member;
};

export const removeMember = async (projectId, userId) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new AppError('Project not found', 404);

  if (project.createdBy === userId) {
    throw new AppError('Cannot remove the project creator', 400);
  }

  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId } },
  });
};
