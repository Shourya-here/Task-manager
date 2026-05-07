import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@venture.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@venture.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create member users
  const memberPassword = await bcrypt.hash('member123', 12);
  const member1 = await prisma.user.upsert({
    where: { email: 'arjun@venture.com' },
    update: {},
    create: {
      name: 'Arjun Sharma',
      email: 'arjun@venture.com',
      password: memberPassword,
      role: 'MEMBER',
      isVerified: true,
    },
  });

  const member2 = await prisma.user.upsert({
    where: { email: 'priya@venture.com' },
    update: {},
    create: {
      name: 'Priya Patel',
      email: 'priya@venture.com',
      password: memberPassword,
      role: 'MEMBER',
      isVerified: true,
    },
  });

  // Create projects
  const project1 = await prisma.project.upsert({
    where: { id: 'seed-project-1' },
    update: {},
    create: {
      id: 'seed-project-1',
      title: 'Infrastructure Modernization',
      description: 'Updating legacy cloud infrastructure and optimizing scaling protocols.',
      createdBy: admin.id,
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: 'seed-project-2' },
    update: {},
    create: {
      id: 'seed-project-2',
      title: 'System Integration API',
      description: 'Developing high-speed data connectors for cross-platform analytics.',
      createdBy: admin.id,
    },
  });

  // Add members to projects
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project1.id, userId: admin.id } },
    update: {},
    create: { projectId: project1.id, userId: admin.id },
  });
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project1.id, userId: member1.id } },
    update: {},
    create: { projectId: project1.id, userId: member1.id },
  });
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project2.id, userId: admin.id } },
    update: {},
    create: { projectId: project2.id, userId: admin.id },
  });
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project2.id, userId: member2.id } },
    update: {},
    create: { projectId: project2.id, userId: member2.id },
  });

  // Create tasks
  const tasks = [
    { title: 'Update Legacy Database', description: 'Run data migration for the new encrypted user repository.', status: 'IN_PROGRESS', priority: 'HIGH', assignedTo: member1.id, projectId: project1.id, createdBy: admin.id, dueDate: new Date('2026-05-15') },
    { title: 'Security Audit', description: 'Coordinate with the pen-testing team to identify system vulnerabilities.', status: 'DONE', priority: 'HIGH', assignedTo: member1.id, projectId: project1.id, createdBy: admin.id, dueDate: new Date('2026-05-10') },
    { title: 'Implement Monitoring Pipeline', description: 'Integrate cloud-watch and prometheus for real-time system tracking.', status: 'TODO', priority: 'MEDIUM', assignedTo: member1.id, projectId: project1.id, createdBy: admin.id, dueDate: new Date('2026-05-20') },
    { title: 'Network Optimization', description: 'Optimize custom load balancers for low-latency delivery.', status: 'TODO', priority: 'LOW', assignedTo: null, projectId: project1.id, createdBy: admin.id, dueDate: new Date('2026-05-25') },
    { title: 'Data Migration', description: 'Convert legacy records to the new distributed storage format.', status: 'IN_PROGRESS', priority: 'HIGH', assignedTo: member2.id, projectId: project2.id, createdBy: admin.id, dueDate: new Date('2026-05-12') },
    { title: 'Benchmark System Latency', description: 'Measure response times across different global regions.', status: 'DONE', priority: 'MEDIUM', assignedTo: member2.id, projectId: project2.id, createdBy: admin.id, dueDate: new Date('2026-05-08') },
    { title: 'Deploy Scalability Server', description: 'Set up auto-scaling groups for high-traffic handling.', status: 'TODO', priority: 'MEDIUM', assignedTo: member2.id, projectId: project2.id, createdBy: admin.id, dueDate: new Date('2026-05-30') },
    { title: 'Final Review', description: 'Run performance benchmarks to confirm system stability before launch.', status: 'TODO', priority: 'LOW', assignedTo: null, projectId: project2.id, createdBy: admin.id, dueDate: new Date('2026-04-01') },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }

  console.log('✅ Seed completed!');
  console.log(`   Admin: admin@venture.com / admin123`);
  console.log(`   Member: arjun@venture.com / member123`);
  console.log(`   Member: priya@venture.com / member123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
