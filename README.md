# Clinic SaaS MVP

Full-stack clinic SaaS scaffold using Next.js, Tailwind CSS, NestJS, Prisma ORM, and PostgreSQL through Docker.

This repository is setup-only. Clinic product features, database models, authentication, and billing are intentionally not implemented yet.

## Project Structure

```text
frontend/          Next.js React app with Tailwind CSS
backend/           NestJS API with Prisma ORM wiring
docker-compose.yml PostgreSQL database service
README.md          Local setup instructions
```

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- Docker Desktop or Docker Engine with Docker Compose

## Installation

Install frontend dependencies:

```bash
cd frontend
npm install
cp .env.example .env.local
```

Install backend dependencies:

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
```

## Run Locally

Start PostgreSQL from the repository root:

```bash
docker compose up -d postgres
```

Start the backend API:

```bash
cd backend
npm run start:dev
```

The backend runs on `http://localhost:3001`. The health check is available at `http://localhost:3001/api/health`.

Start the frontend in a separate terminal:

```bash
cd frontend
npm run dev
```

The frontend runs on `http://localhost:3000`.

## Prisma

The Prisma schema is located at `backend/prisma/schema.prisma`. It is configured for PostgreSQL, but contains no domain models yet.

After adding models later, create a migration with:

```bash
cd backend
npm run prisma:migrate -- --name init
```

Open Prisma Studio with:

```bash
cd backend
npm run prisma:studio
```
