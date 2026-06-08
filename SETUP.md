# EduTrack — Student Profile Manager

A full-stack Next.js application for managing student profiles with GraphQL API, Prisma ORM, PostgreSQL database, and JWT authentication.

---

## Prerequisites

- **Node.js** 18+ (check: `node --version`)
- **PostgreSQL** 13+ running locally or remote
- **npm** or **yarn**

---

## Step 1 — Extract and Install Dependencies

```bash
# If you received a ZIP file, extract it first:
unzip student-profile-manager.zip
cd student-profile-manager

# Install all dependencies
npm install

# This will also generate the Prisma client automatically
```

---

## Step 2 — Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env
```

Open `.env` and update the values:

```env
# Your PostgreSQL connection string
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/student_db?schema=public"

# A strong random secret for JWT signing
JWT_SECRET="replace-this-with-a-long-random-string-at-least-32-chars"

JWT_EXPIRES_IN="7d"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Creating the PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE student_db;

# Exit
\q
```

---

## Step 3 — Run Database Migrations

```bash
# Run Prisma migrations (creates all tables)
npx prisma migrate dev --name init

# Generate the Prisma client
npx prisma generate

# Seed the database with sample data (admin user + 3 students)
npm run db:seed
```

**Seed creates:**
- Admin user: `admin@school.edu` / `admin123`
- 3 sample students

---

## Step 4 — Start the Development Server

```bash
npm run dev
```

Open your browser at: **http://localhost:3000**

---

## Step 5 — Test the Application

### Using the UI

1. Open `http://localhost:3000` — you'll be redirected to `/dashboard`
2. If not logged in, you'll be redirected to `/login`
3. Log in with: `admin@school.edu` / `admin123`
4. You'll see the student management dashboard

**Features to test:**
- ✅ **View students** — table with search, pagination
- ✅ **Add student** — click "+ Add Student" button
- ✅ **Edit student** — click the pencil icon or "Edit Profile" in the side panel
- ✅ **Delete student** — click the trash icon or "Delete" in the side panel
- ✅ **Profile image upload** — click/drag a photo in the side panel
- ✅ **Search** — type in the search bar to filter students
- ✅ **Click a row** — opens the profile side panel

### Testing the GraphQL API Directly

Open Apollo Sandbox at: **http://localhost:3000/api/graphql**

**Step 1: Login**
```graphql
mutation {
  login(email: "admin@school.edu", password: "admin123") {
    token
    user { id email name role }
  }
}
```
Copy the token from the response.

**Step 2: Set Authorization Header**
In the Headers section, add:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Step 3: Query Students**
```graphql
query {
  students(page: 1, pageSize: 10) {
    students {
      id fullName email grade major gpa status
    }
    total totalPages
  }
}
```

**Step 4: Create Student**
```graphql
mutation {
  createStudent(input: {
    firstName: "Test"
    lastName: "Student"
    email: "test@student.edu"
    grade: "12th"
    major: "Engineering"
    gpa: 3.7
    status: ACTIVE
  }) {
    id fullName email
  }
}
```

**Step 5: Update Student**
```graphql
mutation {
  updateStudent(id: "STUDENT_ID", input: {
    major: "Data Science"
    gpa: 3.9
  }) {
    id fullName major gpa
  }
}
```

**Step 6: Delete Student**
```graphql
mutation {
  deleteStudent(id: "STUDENT_ID") {
    success message
  }
}
```

### Testing File Upload

```bash
# Upload a profile image via curl
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg"

# Response: { "imageUrl": "/uploads/uuid.jpg", "filename": "uuid.jpg" }
```

---

## Project Structure

```
student-profile-manager/
├── prisma/
│   ├── schema.prisma          # Database models
│   └── seed.ts                # Seed data
├── public/
│   └── uploads/               # Uploaded profile images (auto-created)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── graphql/       # GraphQL API endpoint
│   │   │   ├── upload/        # File upload/delete endpoint
│   │   │   └── auth/          # Auth check/logout endpoint
│   │   ├── dashboard/         # Protected dashboard pages
│   │   ├── login/             # Login page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── StudentModal.tsx   # Create/Edit student form
│   │   ├── ProfileImageUpload.tsx
│   │   └── StatusBadge.tsx
│   ├── hooks/
│   │   ├── useAuth.tsx        # Auth context + hook
│   │   └── useGraphQL.ts      # GraphQL client hook
│   ├── lib/
│   │   ├── auth/jwt.ts        # JWT + bcrypt utilities
│   │   ├── graphql/
│   │   │   ├── schema.ts      # GraphQL type definitions
│   │   │   └── resolvers.ts   # GraphQL resolvers
│   │   └── prisma/client.ts   # Prisma singleton
│   └── types/index.ts         # TypeScript types
├── .env.example
├── next.config.js
├── package.json
├── tsconfig.json
└── SETUP.md
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:seed` | Seed database with demo data |
| `npm run db:studio` | Open Prisma Studio (visual DB UI) |

---

## Troubleshooting

**"Cannot connect to database"**
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in `.env` matches your credentials

**"Prisma client not generated"**
- Run: `npx prisma generate`

**"JWT_SECRET not set"**
- Make sure `.env` file exists and has `JWT_SECRET` set

**Upload folder permissions**
- The `public/uploads/` directory is auto-created on first upload
- Ensure the app has write permission to the `public/` directory

**Port already in use**
- Use a different port: `PORT=3001 npm run dev`
