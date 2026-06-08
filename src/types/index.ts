export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'SUSPENDED';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  grade?: string;
  major?: string;
  gpa?: number;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  profileImage?: string;
  bio?: string;
  enrolledAt: string;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StudentConnection {
  students: Student[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateStudentInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  grade?: string;
  major?: string;
  gpa?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  bio?: string;
  status?: StudentStatus;
}

export type UpdateStudentInput = Partial<CreateStudentInput>;
