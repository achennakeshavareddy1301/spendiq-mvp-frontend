# SpendIQ - UPI Statement Analysis Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project created at [Firebase Console](https://console.firebase.google.com)

### 1. Install Dependencies

```bash
# Frontend dependencies (already done)
npm install

# Cloud Functions dependencies (already done)
cd functions && npm install && cd ..
```

### 2. Configure Firebase

1. **Login to Firebase:**
   ```bash
   firebase login
   ```

2. **Initialize Firebase Project:**
   ```bash
   firebase use port-9867d
   ```
   (Or use `firebase init` to connect to your project)

3. **Enable Services in Firebase Console:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Enable **Authentication** → Sign-in method → Email/Password
   - Enable **Firestore Database** → Create database (Start in test mode)
   - Enable **Cloud Functions** (requires Blaze plan)

### 3. Configure Environment Variables

**Frontend (.env file):**
Create `.env` in the root directory:

```env
VITE_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=port-9867d.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=port-9867d
VITE_FIREBASE_STORAGE_BUCKET=port-9867d.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_FUNCTIONS_URL=http://localhost:5001/port-9867d/us-central1
```

**Cloud Functions (for production):**
```bash
firebase functions:config:set gemini.api_key="YOUR_GEMINI_API_KEY"
```

**For Local Development:**
The `.runtimeconfig.json` file in `functions/` is already configured with your Gemini API key.

### 4. Run Locally

**Option A: Full Stack with Emulators (Recommended)**

```bash
# Terminal 1: Start Firebase emulators
npm run firebase:emulators

# Terminal 2: Start frontend dev server
npm run dev
```

Then open: http://localhost:8080

**Option B: Frontend Only (Connect to deployed functions)**

Update `VITE_FIREBASE_FUNCTIONS_URL` in `.env` to your deployed function URL, then:

```bash
npm run dev
```

### 5. Deploy to Production

```bash
# Build frontend
npm run build

# Deploy everything (hosting + functions + rules)
npm run firebase:deploy

# Or deploy individually:
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

---

## 📁 Project Structure

```
spendiq-mvp-frontend-main/
├── src/
│   ├── components/
│   │   └── AnalysisView.tsx    # Analysis results display
│   ├── contexts/
│   │   └── AuthContext.tsx     # Firebase Auth state
│   ├── pages/
│   │   ├── Auth.tsx            # Login/Signup page
│   │   ├── UPIAnalysis.tsx     # PDF upload & analysis
│   │   └── Dashboard.tsx       # Analysis history
│   ├── services/
│   │   ├── firebase.ts         # Firebase client config
│   │   └── api.ts              # Cloud Functions API
│   └── types/
│       └── index.ts            # TypeScript interfaces
│
├── functions/                  # Firebase Cloud Functions
│   ├── src/
│   │   ├── index.ts            # API endpoints
│   │   ├── prompts.ts          # Gemini prompts
│   │   └── types.ts            # Shared types
│   └── package.json
│
├── firebase.json               # Firebase config
├── firestore.rules            # Security rules
└── firestore.indexes.json     # Firestore indexes
```

---

## 🔥 API Endpoints

### POST `/analyzeUPI`
Upload and analyze a UPI statement PDF.

**Request:**
- Headers: `Authorization: Bearer <firebase-id-token>`
- Body: `multipart/form-data` with `file` field (PDF)

**Response:**
```json
{
  "success": true,
  "analysisId": "abc123"
}
```

### GET `/getAnalysis?id={analysisId}`
Fetch a specific analysis result.

### GET `/getAnalyses`
Fetch all analyses for the authenticated user.

---

## 🛡️ Security

- All API endpoints require Firebase Authentication
- Firestore rules restrict users to their own data
- PDF files are processed in memory, not stored
- Gemini API key is stored securely in Cloud Functions config

---

## 🐛 Troubleshooting

### "Firebase app not initialized"
- Ensure `.env` file exists with correct Firebase config
- Restart the dev server after adding `.env`

### "Functions not responding"
- Check if emulators are running: `firebase emulators:start`
- Verify `.runtimeconfig.json` exists in `functions/` folder

### "Gemini API error"
- Verify API key is correct in `.runtimeconfig.json` (local) or functions config (production)
- Check [Google AI Studio](https://aistudio.google.com) for quota/billing

### Build errors
```bash
# Clean install
rm -rf node_modules
rm -rf functions/node_modules
npm install
cd functions && npm install
```

---

## 📊 Features

✅ **Email/Password Authentication**
- Sign up and sign in with Firebase Auth
- Protected routes for authenticated users

✅ **PDF Upload & Analysis**
- Drag & drop or click to upload
- PDF-only validation (max 10MB)
- Real-time status updates

✅ **AI-Powered Analysis**
- Transaction extraction via Gemini 1.5 Flash
- Category breakdown with percentages
- Top vendors identification
- Monthly spending trends
- Suspicious transaction detection
- Personalized savings suggestions

✅ **Analysis History**
- View all past analyses
- Expand to see full details
- Status tracking (processing/completed/failed)

---

## 🔮 Future Enhancements

- [ ] Google Sign-In authentication
- [ ] Export analysis to PDF/Excel
- [ ] Budget goal setting
- [ ] Spending alerts and notifications
- [ ] Multi-bank statement support
- [ ] Recurring transaction detection
