# Blog App – Backend  
A production-ready backend API for a full-stack Blog Application.  
Built with **Node.js**, **Express**, **TypeScript**, **Prisma**, **PostgreSQL**, and **JWT Authentication**.

---

## Features

### Authentication & Authorization
- User registration & login  
- Secure authentication using **JWT access tokens**  
- **Refresh token rotation** to keep sessions alive  
- Protected routes using middleware  
- Passwords hashed with **bcrypt**

### Blog Functionality
- Create, read, update, and delete blog posts  
- Draft vs Published posts  
- User–Post relationships  
- Pagination, filtering, search (optional)

### User Management
- Profile retrieval & update  
- Fetch posts created by a specific user  
- Role-based access support (if needed)

### Tech Stack
- **Node.js + Express**  
- **TypeScript**  
- **Prisma ORM**  
- **PostgreSQL**  
- **Zod** for input validation (if being used)  
- **Jest + Supertest** for testing  
- **ESLint + Prettier** for formatting  

---

## Project Structure
```
src/
├── controllers/
├── routes/
├── middleware/
├── services/
├── prisma/
├── utils/
├── tests/
└── app.ts
```

---

## Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/blog-backend.git
cd blog-backend
```
### 2. Install Dependencies
```bash
npm install
```

### 3. Configure environment variables
```
DATABASE_URL="postgresql://user:password@localhost:5432/blogdb"
JWT_SECRET="your_jwt_secret"
REFRESH_SECRET="your_refresh_secret"
PORT=5000
```

### 4. Push Schema and run migrations
```
npx prisma migrate dev
```
### 5. Start Development Server
```
npm run dev
```



