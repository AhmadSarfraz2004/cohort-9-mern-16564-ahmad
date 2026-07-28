# Notes App

A full-stack Notes application developed as part of the **10Pearls Shine Internship Program – Cohort 9 (MERN)**.

## 👨‍💻 Developer

- **Name:** Ahmad Sarfraz
- **Cohort:** 9
- **Domain:** MERN (Node.js + React.js)

---

## 📖 Project Overview

The Notes App enables authenticated users to create, edit, organize, and delete personal notes in a secure and user-friendly environment.

The project is being developed using a feature-based Git workflow, where each feature is implemented in its own branch and merged into the `develop` branch through Pull Requests.

---

## 🛠️ Technology Stack

### Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- Pino Logger

### Frontend

- React
- TypeScript

### Development Tools

- Git & GitHub
- ESLint
- Prettier
- Mocha / Chai
- Jest
- SonarQube

---

## 📂 Project Structure

```
backend/
frontend/
```

The backend follows a feature-based architecture.

```
backend/
│
├── src
│   ├── common
│   ├── config
│   ├── modules
│   ├── routes
│   ├── app.ts
│   └── server.ts
│
├── tests
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/AhmadSarfraz2004/cohort-9-mern-16564-ahmad.git
```

### Install backend dependencies

```bash
cd backend
npm install
```

### Create environment file

Create a `.env` file using `.env.example`.

Example:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=
JWT_SECRET=
```

### Start development server

```bash
npm run dev
```

The backend server will start on:

```
http://localhost:5000
```

---

## 🩺 Health Check

Verify the backend is running by visiting:

```
GET /api/health
```

Example response:

```json
{
  "success": true,
  "message": "Backend is running successfully.",
  "timestamp": "2026-07-25T12:00:00.000Z"
}
```

---

## 🌿 Git Workflow

This repository follows a feature branch workflow.

```
develop
   │
   ├── feature/backend/project-setup
   ├── feature/backend/auth
   ├── feature/backend/notes
   └── ...
```

Every feature is developed in its own branch and submitted through a Pull Request into the `develop` branch.

---

## 📌 Current Status

- ✅ Backend project initialized
- ✅ TypeScript configured
- ✅ Express server configured
- ✅ ES Modules (NodeNext)
- ✅ Feature-based folder structure
- ✅ Health endpoint implemented
- ⏳ MongoDB integration
- ⏳ Authentication
- ⏳ Notes CRUD
- ⏳ Frontend implementation

---

## 📄 License

This project is developed as part of the **10Pearls Shine Internship Program** for learning and evaluation purposes.