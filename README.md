<div align="center">

# SpendIQ

### AI Personal Finance Mentor for UPI

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.1-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.0-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Made in India](https://img.shields.io/badge/Made_in-India-FF9933?style=for-the-badge)](https://en.wikipedia.org/wiki/India)

<p align="center">
  <strong>Built for Indian users | AI-driven insights | Portfolio-aware guidance</strong>
</p>

[Live Demo](https://spendiq-mvp-frontend.vercel.app/) • [Report Bug](https://github.com/achennakeshavareddy1301/spendiq-mvp-frontend/issues) • [Request Feature](https://github.com/achennakeshavareddy1301/spendiq-mvp-frontend/issues)

</div>

---

## Overview

SpendIQ turns Indian UPI statements into clear, actionable financial guidance. It analyzes transactions, computes a Money Health Score, builds a FIRE plan, and delivers AI mentor recommendations and chat.

## Features

- UPI statement ingestion (PDF) with automated extraction and categorization
- Money Health Score with savings rate and stability insights
- FIRE planner (corpus target, SIP required, years to FI)
- AI financial mentor with action items and portfolio suggestions
- Advisor chat with context from your latest analysis
- Portfolio snapshot (manual) to personalize advice
- Analytics dashboard with trends, vendors, and category breakdowns
- Downloadable PDF report

## Tech Stack

| Category | Technologies |
|----------|-------------|
| Frontend | React 18, TypeScript, Vite, React Router |
| Styling | Tailwind CSS, shadcn/ui, Lucide Icons |
| AI/ML | Google Gemini 2.0 Flash API |
| Backend | Firebase Auth, Cloud Firestore, Cloud Functions |
| Charts | Recharts |
| PDF | jsPDF, PDF.js |
| State | React Query, React Context |

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase account
- Gemini API key

### Install

```bash
# Frontend
npm install

# Cloud Functions
cd functions && npm install && cd ..
```

### Configure Environment

Create a .env file in the repo root:

```env
VITE_FIREBASE_API_KEY=your-key
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_FUNCTIONS_URL=http://localhost:5001/your-project-id/us-central1
```

### Run Locally

```bash
# Terminal 1
npm run firebase:emulators

# Terminal 2
npm run dev
```

Open http://localhost:8080

For more detailed setup (including Firebase configuration), see SETUP.md.

## Scripts

- npm run dev: Start Vite dev server
- npm run build: Production build
- npm run preview: Preview production build
- npm run firebase:emulators: Start Firebase emulators
- npm run firebase:deploy: Deploy hosting + functions + rules

## API Endpoints (Functions)

- POST /analyzeUPI: Upload and analyze UPI statement
- GET /getAnalysis?id=...: Fetch a single analysis
- GET /getAnalyses: Fetch all analyses for the user
- POST /analyzeFinancials: AI mentor (advice and chat)

## Flow Charts

<img width="1879" height="932" alt="image" src="https://github.com/user-attachments/assets/63a4b3ee-6799-4c8f-9a6e-1c09cef8be79" />

<img width="1882" height="931" alt="image" src="https://github.com/user-attachments/assets/64deb28d-2d36-4fd5-8872-948a778883fe" />

<img width="498" height="930" alt="image" src="https://github.com/user-attachments/assets/5c57878a-3c72-4be7-8fb0-44d482c4e584" />

## Notes

- Cloud Functions require the Firebase Blaze plan for deployment.
- Gemini API key is configured via Firebase Functions config.

## Author

A Chennakeshava Reddy

<img src="https://img.shields.io/badge/GitHub-achennakeshavareddy1301-181717?style=for-the-badge&logo=github" alt="GitHub">

## Acknowledgments

Firebase - Backend and Authentication
Google Gemini - AI and ML capabilities
shadcn/ui - UI components
Recharts - Chart library
Tailwind CSS - Styling
Vite - Build tool

Star this repo if you found it helpful.
