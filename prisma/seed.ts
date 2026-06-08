import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@school.edu' },
    update: {},
    create: {
      email: 'admin@school.edu',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log('✅ Seeded admin user:', admin.email);

  const students = [
    {
      firstName: 'Arjun',
      lastName: 'Sharma',
      email: 'arjun.sharma@student.edu',
      phone: '+91-98765-43210',
      grade: '11th',
      major: 'Computer Science',
      gpa: 3.8,
      city: 'Chennai',
      state: 'Tamil Nadu',
      status: 'ACTIVE' as const,
    },
    {
      firstName: 'Priya',
      lastName: 'Patel',
      email: 'priya.patel@student.edu',
      phone: '+91-87654-32109',
      grade: '12th',
      major: 'Mathematics',
      gpa: 3.9,
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      status: 'ACTIVE' as const,
    },
    {
      firstName: 'Rahul',
      lastName: 'Kumar',
      email: 'rahul.kumar@student.edu',
      phone: '+91-76543-21098',
      grade: '10th',
      major: 'Physics',
      gpa: 3.5,
      city: 'Salem',
      state: 'Tamil Nadu',
      status: 'ACTIVE' as const,
    },
  ];

  for (const student of students) {
    await prisma.student.upsert({
      where: { email: student.email },
      update: {},
      create: student,
    });
  }

  console.log('✅ Seeded', students.length, 'students');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
