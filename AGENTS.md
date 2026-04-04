# Teacher LMS - Agent Context

## Project Snapshot

| Layer | Tech |
|-------|------|
| Framework | React 19 + Vite 6 |
| Language | TypeScript 5.8 |
| Styling | Tailwind CSS v4 |
| State | React Context (Auth) + useSubscribe hooks |
| Backend | Supabase (Auth + DB + Storage) |
| Auth | Email/password only |
| Routing | React Router v7 |
| Icons | Lucide React |
| Animation | Framer Motion |

**Portals**:
- Admin: Full CRUD, analytics, reports, messaging
- Teacher: Classes, students, attendance, homework, exams  
- Student: Dashboard, classes, homework, exams, progress, messages

**Key Files**:
- `src/App.tsx` — Main app with role-based routing
- `src/contexts/AuthProvider.tsx` — Supabase auth + role detection
- `src/supabase.ts` — Dual client setup (client + service role)
- `src/hooks/useSubscribe.ts` — Generic data fetching hook
- `src/hooks/useTeacherActions.ts` — Pre-authenticated CRUD actions
- `src/features/teacher/sections/` — Teacher portal sections
- `src/features/student/StudentApp.tsx` — Student portal
- `src/components/AdminPortal.tsx` — Admin portal
- `lib/db/supabase/` — Schema, seed, account scripts

## Current State

**✅ Built & Deployed**:
- Repository: https://github.com/cuonglhv-code/lms-portal
- Vercel: https://lms-portal-blue.vercel.app/
- Database schema: 12 tables + indexes
- Seed data: Admin + 4 teachers + 10 students
- Auth: Login/logout with role detection (admin/teacher/student)
- UI: Shared components (Button, Card, DataTable, StatCard, Badge)
- Layout: AppHeader, Sidebar, PageContainer, PageHeader
- Teacher portal sections: Dashboard, Classes, Students, Attendance, Homework, Exams, Communication, Reports, Import, Export
- Student portal: Dashboard, Classes, Homework, Exams, Progress, Communication
- Admin portal: Dashboard, Users, Classes, Centers, Analytics, Reports, Messaging
- CSV import: Students, Lesson Plans, Classes (with preview)

**⚠️ Known Issues**:
1. **Environment variables** — Vercel deployment requires:
   - `VITE_SUPABASE_URL` = `https://psfeixnxxjmnpsgnkuhy.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `[anon key from Supabase]`
   Without these, app shows blank page or infinite loading.

2. **Data shape mismatch** — Some frontend models expect different fields than DB returns:
   - Frontend: `exam.writing`, `exam.reading`, `exam.speaking`, `exam.listening`
   - DB: `exam.score`, `exam.percentage`
   - Fixed in DashboardSection with `getExamAverage()` helper

3. **RLS policies** — Row Level Security enabled but causes 403/409 errors in development:
   - Quick fix: Disable RLS on all tables (run in Supabase SQL Editor)
   - Proper fix: Update policies to use email matching instead of auth_id

**✅ Test Accounts**:
| Role | Email | Password |
|------|-------|----------|
| Admin | cuonglhv@jaxtina.com | Jaxtina2026 |
| Teacher | sarah.chen@jaxtina.com | Jaxtina2026 |
| Student | j.thompson@email.com | Jaxtina2026 |

## Agent Workflow

### Step 1: Load Context (Save Tokens)
**Read these files FIRST to understand current state**:
1. `AGENTS.md` (this file) — 30 seconds read
2. `src/App.tsx` — Understand routing and role detection
3. `src/contexts/AuthProvider.tsx` — Understand auth flow
4. `src/supabase.ts` — Understand Supabase setup

**Skip**: Reading every component/service unless building/modifying that specific area.

### Step 2: Pick Skills Based on Task

| Task Type | Skill to Call |
|-----------|--------------|
| Build UI/component | `/teacher-portal-ui-ux <task>` |
| Fix bug/crash | `/teacher-portal-debug-fix <symptom>` |
| DB ops/seed/import | `/teacher-portal-data-ops <action>` |
| Add new feature | `/teacher-portal-feature-builder <name>` |
| Schema/migration | `/teacher-portal-db-schema <action>` |

### Step 3: Follow Skill Instructions
Each skill provides:
- Concise invocation format
- Step-by-step process
- File locations to modify
- Code snippets to copy/paste
- Rules to follow

### Step 4: Verify & Commit
1. Test changes locally: `npm run dev`
2. Fix any lint/typescript errors
3. Commit with descriptive message
4. Push to trigger Vercel redeploy

## Quick Reference

**Env Vars (Vercel/.env)**:
```
VITE_SUPABASE_URL=https://psfeixnxxjmnpsgnkuhy.supabase.co
VITE_SUPABASE_ANON_KEY=[anon key]
```

**Local Dev**:
```bash
cp .env.example .env
# Add your Supabase keys to .env
npm run dev  # http://localhost:5173
```

**Database Scripts** (require `.env` with SERVICE_ROLE_KEY):
```bash
npx tsx lib/db/supabase/create-admin.ts
npx tsx lib/db/supabase/create-accounts.ts
```

**Disable RLS (Dev Only)**:
Run in Supabase SQL Editor:
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE centers DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE homework DISABLE ROW LEVEL SECURITY;
ALTER TABLE homework_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE exams DISABLE ROW LEVEL SECURITY;
ALTER TABLE exam_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
```

**Test Credentials**:
- Admin: cuonglhv@jaxtina.com / Jaxtina2026
- Teacher: sarah.chen@jaxtina.com / Jaxtina2026  
- Student: j.thompson@email.com / Jaxtina2026

## Token Saving Tips

1. **Read AGENTS.md first** — gives you 80% context in <1 minute
2. **Only read specific files** when building/fixing that area
3. **Use skills** — they contain exact file paths and code snippets
4. **Leverage existing patterns** — copy/paste similar components/hooks
5. **Ask for clarification** if unsure — better than guessing

Last session ended with: CSV import feature built and pushed. Next step: Verify Vercel deployment has correct env vars, then test all three portals with test accounts.