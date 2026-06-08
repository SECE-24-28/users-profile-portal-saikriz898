import { prisma } from '../prisma/client';
import { signToken, hashPassword, comparePassword } from '../auth/jwt';
import { GraphQLScalarType, Kind } from 'graphql';

const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime scalar',
  serialize(value: unknown) {
    if (value instanceof Date) return value.toISOString();
    return value;
  },
  parseValue(value: unknown) {
    if (typeof value === 'string' || typeof value === 'number') return new Date(value);
    return null;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) return new Date(ast.value);
    return null;
  },
});

interface Context {
  user?: { userId: string; email: string; role: string } | null;
}

function requireAuth(context: Context) {
  if (!context.user) throw new Error('Authentication required');
  return context.user;
}

export const resolvers = {
  DateTime: DateTimeScalar,

  Student: {
    fullName: (parent: { firstName: string; lastName: string }) =>
      `${parent.firstName} ${parent.lastName}`,
  },

  Query: {
    students: async (
      _: unknown,
      args: { page?: number; pageSize?: number; filter?: { search?: string; status?: string; grade?: string; major?: string } },
      context: Context
    ) => {
      requireAuth(context);
      const page = args.page || 1;
      const pageSize = args.pageSize || 10;
      const skip = (page - 1) * pageSize;

      const where: Record<string, unknown> = {};

      if (args.filter?.search) {
        const search = args.filter.search;
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { major: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (args.filter?.status) where.status = args.filter.status;
      if (args.filter?.grade) where.grade = args.filter.grade;
      if (args.filter?.major) where.major = { contains: args.filter.major, mode: 'insensitive' };

      const [students, total] = await Promise.all([
        prisma.student.findMany({ where, skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
        prisma.student.count({ where }),
      ]);

      return { students, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    },

    student: async (_: unknown, args: { id: string }, context: Context) => {
      requireAuth(context);
      const student = await prisma.student.findUnique({ where: { id: args.id } });
      if (!student) throw new Error('Student not found');
      return student;
    },

    me: async (_: unknown, __: unknown, context: Context) => {
      const user = requireAuth(context);
      return prisma.user.findUnique({ where: { id: user.userId } });
    },
  },

  Mutation: {
    login: async (_: unknown, args: { email: string; password: string }) => {
      const user = await prisma.user.findUnique({ where: { email: args.email } });
      if (!user) throw new Error('Invalid credentials');
      const valid = await comparePassword(args.password, user.password);
      if (!valid) throw new Error('Invalid credentials');
      const token = signToken({ userId: user.id, email: user.email, role: user.role });
      return { token, user };
    },

    register: async (_: unknown, args: { email: string; password: string; name: string }) => {
      const existing = await prisma.user.findUnique({ where: { email: args.email } });
      if (existing) throw new Error('Email already registered');
      const hashedPassword = await hashPassword(args.password);
      const user = await prisma.user.create({
        data: { email: args.email, password: hashedPassword, name: args.name },
      });
      const token = signToken({ userId: user.id, email: user.email, role: user.role });
      return { token, user };
    },

    createStudent: async (_: unknown, args: { input: Record<string, unknown> }, context: Context) => {
      requireAuth(context);
      const existing = await prisma.student.findUnique({ where: { email: args.input.email as string } });
      if (existing) throw new Error('Email already exists');
      return prisma.student.create({ data: args.input as Parameters<typeof prisma.student.create>[0]['data'] });
    },

    updateStudent: async (_: unknown, args: { id: string; input: Record<string, unknown> }, context: Context) => {
      requireAuth(context);
      const student = await prisma.student.findUnique({ where: { id: args.id } });
      if (!student) throw new Error('Student not found');
      if (args.input.email && args.input.email !== student.email) {
        const existing = await prisma.student.findUnique({ where: { email: args.input.email as string } });
        if (existing) throw new Error('Email already in use');
      }
      return prisma.student.update({ where: { id: args.id }, data: args.input as Parameters<typeof prisma.student.update>[0]['data'] });
    },

    deleteStudent: async (_: unknown, args: { id: string }, context: Context) => {
      requireAuth(context);
      const student = await prisma.student.findUnique({ where: { id: args.id } });
      if (!student) throw new Error('Student not found');
      await prisma.student.delete({ where: { id: args.id } });
      return { success: true, message: 'Student deleted successfully' };
    },

    updateStudentImage: async (_: unknown, args: { id: string; imageUrl: string }, context: Context) => {
      requireAuth(context);
      const student = await prisma.student.findUnique({ where: { id: args.id } });
      if (!student) throw new Error('Student not found');
      return prisma.student.update({ where: { id: args.id }, data: { profileImage: args.imageUrl } });
    },
  },
};
