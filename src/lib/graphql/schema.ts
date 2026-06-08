import { gql } from 'graphql-tag';

export const typeDefs = gql`
  scalar DateTime
  scalar Upload

  enum StudentStatus {
    ACTIVE
    INACTIVE
    GRADUATED
    SUSPENDED
  }

  type Student {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    dateOfBirth: DateTime
    grade: String
    major: String
    gpa: Float
    address: String
    city: String
    state: String
    country: String!
    profileImage: String
    bio: String
    enrolledAt: DateTime!
    status: StudentStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
    fullName: String!
  }

  type User {
    id: ID!
    email: String!
    name: String!
    role: String!
    createdAt: DateTime!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type StudentConnection {
    students: [Student!]!
    total: Int!
    page: Int!
    pageSize: Int!
    totalPages: Int!
  }

  type DeleteResult {
    success: Boolean!
    message: String!
  }

  input CreateStudentInput {
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    dateOfBirth: DateTime
    grade: String
    major: String
    gpa: Float
    address: String
    city: String
    state: String
    country: String
    bio: String
    status: StudentStatus
  }

  input UpdateStudentInput {
    firstName: String
    lastName: String
    email: String
    phone: String
    dateOfBirth: DateTime
    grade: String
    major: String
    gpa: Float
    address: String
    city: String
    state: String
    country: String
    bio: String
    status: StudentStatus
  }

  input StudentFilterInput {
    search: String
    status: StudentStatus
    grade: String
    major: String
  }

  type Query {
    students(
      page: Int
      pageSize: Int
      filter: StudentFilterInput
    ): StudentConnection!
    student(id: ID!): Student
    me: User
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
    register(email: String!, password: String!, name: String!): AuthPayload!
    createStudent(input: CreateStudentInput!): Student!
    updateStudent(id: ID!, input: UpdateStudentInput!): Student!
    deleteStudent(id: ID!): DeleteResult!
    updateStudentImage(id: ID!, imageUrl: String!): Student!
  }
`;
