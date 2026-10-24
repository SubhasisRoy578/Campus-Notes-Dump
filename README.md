# CampusNotes — The Shared Academic Library for University Scholars

CampusNotes is a production-oriented open-access academic resource library for university students and scholars. Designed with an editorial, paper-like aesthetic inspired by collegiate publishing, it allows anyone to browse and download syllabus-aligned lecture materials, previous-year exam papers, lab manuals, and verified course materials across all 8 undergraduate semesters.

---

## Architecture & Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7, Motion
- **Icons & Typography:** Noto Serif (editorial headers), Inter (data density & UI), JetBrains Mono (course codes & metadata), Google Material Symbols
- **Backend Services:** Firebase Authentication, Cloud Firestore, Cloud Storage
- **Security:** Strict Firestore & Storage Rules enforcing immutable published records and admin moderation

---

## Curricular Taxonomy

1. **1st Year (Stage 01: Foundation & Applied Sciences)**
   - Semester 1 (MA101, ME101, PH101)
   - Semester 2 (MA102, CS101, CH101, ME102)
2. **2nd Year (Stage 02: Core Engineering Disciplines)**
   - Semester 3 (CS201 Data Structures & Algorithms, CS202 Digital Logic, MA201 Linear Algebra, CS204 Discrete Math)
   - Semester 4 (CS205 Algorithms, CS206 OS Principles, EE204 Signals & Systems, CS208 Microprocessors)
3. **3rd Year (Stage 03: Advanced Theory & Systems)**
   - Semester 5 (CS301 Distributed Systems, CS302 DBMS, CS303 Computer Networks, CS304 Automata Theory)
   - Semester 6 (CS305 Compiler Design, CS306 Distributed Systems II, CS307 AI & Machine Learning, CS308 Web Tech)
4. **4th Year (Stage 04: Specialization & Capstones)**
   - Semester 7 (CS401 Cryptography, CS402 Cloud Computing, Electives)
   - Semester 8 (CS490 Major Capstone Reports, CS491 Technical Seminar Archives)

---

## Core Product Capabilities

1. **Open-Access Public Browsing:** No account or sign-up required to search, browse subjects, or download documents.
2. **Immutable Published Records:** Ordinary users cannot edit, overwrite, or delete published resources once archived. Revisions must be submitted as distinct editions.
3. **Verified TA Fast-Track vs. Student Moderation:** Teaching Assistants (e.g. Marcus S.) receive immediate clearance to the live catalog, while undergraduate submissions enter the peer-moderation queue.
4. **Document Viewer & Paper Sheet Canvas:** Authentic physical paper aesthetic with vector diagrams (AVL rotations LL/RR/LR/RL, complexity bounds tables), zoom, and citation export (APA, MLA, Chicago, BibTeX).
5. **Administrative Moderation Workspace (`/admin`):** Senate board review desk with pending submissions queue, report resolution, and immutable moderation audit logs.
6. **Save to Stacks:** Personal scholarly bookmarking stored in user's profile.

---

## Development Setup

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run unit tests
npx --yes tsx --test src/utils/academicLogic.test.ts

# Production build check
npm run build
```

---

## Firebase Configuration

To link your live Firebase project, set the following environment variables in `.env`:

```env
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-app-id"
VITE_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"
```

Deploy security rules using Firebase CLI:
```bash
firebase deploy --only firestore:rules,storage
```

---

## Test Personas Available in Navigation

- **Guest:** Signed out (public browsing mode)
- **Marcus S. (Verified TA):** Fast-track clearance privilege
- **Dr. Allen (Academic Senate Lead / Admin):** Full moderation authority
