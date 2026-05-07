import prisma from '../config/db.js';

export const getStats = async (user) => {
  const where = user.role === 'MEMBER' ? { assignedTo: user.id } : {};

  const [totalTasks, todoTasks, inProgressTasks, doneTasks, overdueTasks, highPriority, mediumPriority, lowPriority, totalProjects, recentTasks] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.count({ where: { ...where, status: 'TODO' } }),
    prisma.task.count({ where: { ...where, status: 'IN_PROGRESS' } }),
    prisma.task.count({ where: { ...where, status: 'DONE' } }),
    prisma.task.count({
      where: {
        ...where,
        status: { not: 'DONE' },
        dueDate: { lt: new Date() },
      },
    }),
    prisma.task.count({ where: { ...where, priority: 'HIGH' } }),
    prisma.task.count({ where: { ...where, priority: 'MEDIUM' } }),
    prisma.task.count({ where: { ...where, priority: 'LOW' } }),
    user.role === 'ADMIN'
      ? prisma.project.count()
      : prisma.projectMember.count({ where: { userId: user.id } }),
    prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true } },
        project: { select: { id: true, title: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    }),
  ]);

  // Get members count for admin
  let totalMembers = 0;
  if (user.role === 'ADMIN') {
    totalMembers = await prisma.user.count();
  }

  return {
    totalTasks,
    todoTasks,
    inProgressTasks,
    doneTasks,
    overdueTasks,
    totalProjects,
    totalMembers,
    byStatus: [
      { name: 'To Do', value: todoTasks, color: '#6366f1' },
      { name: 'In Progress', value: inProgressTasks, color: '#f59e0b' },
      { name: 'Done', value: doneTasks, color: '#10b981' },
    ],
    byPriority: [
      { name: 'High', value: highPriority, color: '#ef4444' },
      { name: 'Medium', value: mediumPriority, color: '#f59e0b' },
      { name: 'Low', value: lowPriority, color: '#10b981' },
    ],
    recentActivity: recentTasks,
    completionRate: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
  };
};

export const getOverdueTasks = async (user) => {
  const where = {
    status: { not: 'DONE' },
    dueDate: { lt: new Date() },
  };

  if (user.role === 'MEMBER') {
    where.assignedTo = user.id;
  }

  return prisma.task.findMany({
    where,
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, title: true } },
    },
    orderBy: { dueDate: 'asc' },
  });
};
