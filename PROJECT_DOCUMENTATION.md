# PrivacyGuard - Project Documentation

## 📋 Table of Contents
1. [Problem Statement](#problem-statement)
2. [Solution Overview](#solution-overview)
3. [Technology Stack](#technology-stack)
4. [Architecture](#architecture)
5. [Challenges Faced](#challenges-faced)
6. [Data Flow](#data-flow)
7. [Firestore Data Structure](#firestore-data-structure)
8. [API Endpoints](#api-endpoints)

---

## 🎯 Problem Statement

**Context**: In today's digital world, users frequently accept privacy policies and terms of service without understanding the potential risks to their personal data. Most users lack the expertise to identify concerning clauses in these legal documents.

**Problem**: 
- Users cannot easily identify privacy risks in policies
- Privacy policies are often lengthy and complex
- Many apps collect excessive personal data
- Users need a way to quantify and compare privacy risks

**Goals**:
- Provide automated privacy risk analysis using NLP
- Score privacy policies on a scale of 0-100
- Identify specific red flags (location tracking, biometric data, etc.)
- Generate letter grades (A-F) for easy understanding
- Allow users to track their scan history

---

## ✅ Solution Overview

**PrivacyGuard** is a web application that:

1. **Analyzes Privacy Policies**: Uses keyword-based NLP to detect privacy risks in text
2. **Scores Risk Levels**: Calculates weighted risk scores (Minimal → High)
3. **Identifies Red Flags**: Highlights critical privacy concerns
4. **Provides Grades**: Converts scores to letter grades (A-F)
5. **Stores History**: Saves scans to Firestore for user reference
6. **Shows Dashboard**: Displays user statistics and quick actions

### Key Features:
- 🔍 Deep privacy scan using keyword detection
- 🚩 Red flag identification for critical risks
- 📊 Risk scoring with weighted algorithms
- 📈 User dashboard with statistics
- 📜 History of all scans per user
- 🔐 Secure authentication with Firebase Auth
- 💾 Persistent storage with Firestore

---

## 🛠 Technology Stack

### Frontend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **Next.js** | React framework with App Router | 16.1.6 |
| **React** | UI library | 19.2.3 |
| **TypeScript** | Type safety | 5.x |
| **Tailwind CSS** | Styling | 4.1.18 |
| **Framer Motion** | Animations | 12.33.0 |
| **Firebase Auth** | Authentication | 12.9.0 |
| **Firebase Firestore** | Database | 12.9.0 |
| **Axios** | HTTP client | 1.13.4 |
| **Lucide React** | Icons | 0.563.0 |

### Backend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **Python** | Runtime | 3.x |
| **FastAPI** | Web framework | 0.100+ |
| **Uvicorn** | ASGI server | 0.23+ |
| **Pydantic** | Data validation | 2.0+ |
| **python-multipart** | Form handling | 0.0.6 |

### Development Tools
| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| PostCSS | CSS processing |
| TypeScript | Compile-time checking |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Login    │  │ Register  │  │  Analyze │  │ Dashboard │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│        │            │            │            │              │
│        └────────────┴────────────┴────────────┘              │
│                         │                                      │
│              ┌─────────▼─────────┐                           │
│              │  AuthContext      │                           │
│              │  (Firebase Auth)  │                           │
│              └─────────┬─────────┘                           │
│                        │                                     │
│         ┌──────────────┴──────────────┐                     │
│         │     Firestore Database      │                     │
│         │  - users/{uid}              │                     │
│         │  - scans/{scanId}          │                     │
│         │  - userStats/{statId}       │                     │
│         └─────────────────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP POST /analyze
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend (FastAPI)                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  PrivacyAnalyzer                    │    │
│  │  - Keyword detection (80+ privacy keywords)       │    │
│  │  - Weighted scoring algorithm                      │    │
│  │  - Risk level classification                       │    │
│  │  - Red flag identification                        │    │
│  │  - Summary generation                             │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Frontend Components

```
src/app/
├── page.tsx                 # Landing page
├── layout.tsx              # Root layout with providers
├── globals.css             # Global styles
│
├── login/page.tsx          # User login
├── register/page.tsx       # User registration
│
├── dashboard/page.tsx      # User dashboard with stats
├── analyze/page.tsx        # Privacy policy analysis
├── history/page.tsx        # Scan history
└── profile/page.tsx        # User profile

src/components/
├── Navbar.tsx              # Navigation bar
├── BackButton.tsx          # Navigation back button
├── RiskGauge.tsx           # Risk score visualization
├── RadarScanner.tsx        # Scanning animation
├── ScanResultCard.tsx      # Results display card
├── RedFlagBadge.tsx        # Red flag indicators
├── AnimatedBackground.tsx   # Animated background
└── ProtectedRoute.tsx      # Auth protection wrapper

src/lib/
├── firebase.ts             # Firebase configuration
├── firestore.ts            # Firestore operations
├── AuthContext.tsx         # Authentication context
└── utils.ts               # Utility functions
```

### Backend Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── analyzer.py             # NLP privacy analysis logic
├── models.py               # Pydantic data models
└── requirements.txt        # Python dependencies
```

---

## ⚠️ Challenges Faced

### 1. **User-Based Data Isolation**
- **Challenge**: Ensuring users can only see their own scans
- **Solution**: Added `userId` field to all scan documents and implemented Firestore security rules
- **Code**:
```typescript
// Firestore query with user filtering
const q = query(
  scansRef,
  where('userId', '==', user.uid)
);
```

### 2. **Realtime Data Updates**
- **Challenge**: Dashboard and History pages not updating automatically
- **Solution**: Implemented `onSnapshot` for realtime Firestore listeners
- **Code**:
```typescript
const unsubscribe = onSnapshot(q, (snapshot) => {
  // Update state when data changes
  setScans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
});
```

### 3. **Missing Firestore Indexes**
- **Challenge**: Queries with `where` and `orderBy` fail without composite indexes
- **Solution**: Added fallback query without ordering, and recommended index creation
- **Code**:
```typescript
try {
  // Try with ordering first
  const q = query(scansRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
} catch (error) {
  // Fallback without orderBy
  const q = query(scansRef, where('userId', '==', user.uid));
}
```

### 4. **Async Data Loading**
- **Challenge**: Race conditions between auth loading and data fetching
- **Solution**: Proper useEffect dependencies and loading states
- **Code**:
```typescript
useEffect(() => {
  if (!loading && !user) {
    router.push('/login');
  }
}, [user, loading, router]);

useEffect(() => {
  if (user) {
    fetchData();
  }
}, [user]);
```

### 5. **Firebase Server Timestamps**
- **Challenge**: Handling Firestore server timestamps in frontend
- **Solution**: Created helper functions to convert timestamps
- **Code**:
```typescript
const formatDate = (timestamp: any) => {
  if (!timestamp) return 'Unknown date';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString();
};
```

### 6. **CORS Configuration**
- **Challenge**: Frontend unable to connect to backend API
- **Solution**: Added CORS middleware in FastAPI
- **Code**:
```python
app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:3000"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)
```

---

## 🔄 Data Flow

### Analysis Flow
```
1. User enters text in Analyze page
2. Frontend sends POST /analyze with text
3. Backend receives request
4. PrivacyAnalyzer processes text:
   - Scans for 80+ privacy keywords
   - Calculates weighted risk score
   - Identifies red flags
   - Generates summary & recommendations
5. Backend returns AnalysisResponse
6. Frontend displays results
7. Frontend saves to Firestore:
   - userId (from auth)
   - risk_score
   - risk_level
   - red_flags
   - summary
   - grade
   - createdAt (serverTimestamp)
8. Dashboard & History auto-update via onSnapshot
```

### User Authentication Flow
```
1. User enters credentials
2. Firebase Auth validates
3. AuthContext updates user state
4. Protected routes allow access
5. All Firestore queries filter by user.uid
```

---

## 📦 Firestore Data Structure

### Collection: `users/{userId}`
```json
{
  "email": "user@example.com",
  "createdAt": "2024-01-15T10:30:00Z",
  "lastLogin": "2024-01-15T10:30:00Z"
}
```

### Collection: `scans/{scanId}`
```json
{
  "userId": "abc123xyz",
  "text": "Original policy text...",
  "risk_score": 85,
  "risk_level": "High",
  "red_flags": [
    "location tracking",
    "third-party sharing"
  ],
  "summary": "This text contains significant privacy risks...",
  "grade": "F",
  "detected_keywords": [
    "location tracking",
    "third-party sharing",
    "advertising id"
  ],
  "recommendations": [
    "Review and understand how your data is being collected..."
  ],
  "createdAt": {
    "_seconds": 1705315800,
    "_nanoseconds": 0
  }
}
```

### Collection: `userStats/{statId}`
```json
{
  "userId": "abc123xyz",
  "totalScans": 24,
  "highRiskCount": 5,
  "mediumRiskCount": 12,
  "lowRiskCount": 7,
  "averageRiskScore": 58,
  "lastScanDate": {
    "_seconds": 1705315800,
    "_nanoseconds": 0
  },
  "updatedAt": {
    "_seconds": 1705315800,
    "_nanoseconds": 0
  }
}
```

---

## 🔌 API Endpoints

### POST `/analyze`
Analyze text for privacy risks.

**Request**:
```json
{
  "text": "This app collects your location data..."
}
```

**Response**:
```json
{
  "risk_score": 85,
  "risk_level": "High",
  "red_flags": ["location tracking", "background location"],
  "summary": "This text contains significant privacy risks...",
  "detected_keywords": ["location tracking", "background location"],
  "recommendations": ["Consider disabling location services..."],
  "grade": "F",
  "analyzed_at": "2024-01-15T10:30:00Z"
}
```

### GET `/health`
Health check endpoint.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 🔒 Security Rules (firestore.rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if isAuthenticated() && isOwner(userId);
    }
    
    // Scans collection
    match /scans/{scanId} {
      allow read: if isAuthenticated() && isOwner(resource.data.userId);
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
      allow delete: if isAuthenticated() && isOwner(resource.data.userId);
      allow list: if isAuthenticated();
    }
  }
}
```

---

## 📊 Risk Scoring Algorithm

The analyzer uses a weighted keyword detection system:

| Category | Weight Range | Examples |
|----------|-------------|----------|
| **Critical** | 80-100 | location tracking, biometric data, genetic data |
| **High** | 60-80 | camera access, contacts, third-party sharing |
| **Medium** | 40-60 | IP address, cookies, analytics |
| **Low** | 20-40 | preferences, newsletters, marketing |

### Score Calculation:
1. Base score from keyword weights
2. Category boost (max 25 points)
3. Multi-item bonus (max 15 points)
4. Final score capped at 100

### Risk Level Thresholds:
- **Minimal**: 0-24
- **Low**: 25-49
- **Medium**: 50-74
- **High**: 75-100

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.8+
- Firebase project

### Installation

1. **Clone the repository**
2. **Install frontend dependencies**:
```bash
npm install
```

3. **Install backend dependencies**:
```bash
cd backend
pip install -r requirements.txt
```

4. **Configure Firebase**:
   - Create Firebase project
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Copy config to `lib/firebase.ts`

5. **Deploy Firestore Rules**:
   - Copy `firestore.rules` to Firebase Console

### Running the Application

1. **Start backend**:
```bash
cd backend
uvicorn main:app --reload
```

2. **Start frontend** (new terminal):
```bash
npm run dev
```

3. **Open browser**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

---

## 📈 Future Enhancements

1. **PDF Upload Support** - Parse privacy policies from PDF files
2. **Multiple User Plans** - Free tier with limited scans, paid tier with unlimited
3. **Comparison Feature** - Compare two policies side-by-side
4. **Export Reports** - Download detailed PDF reports
5. **Email Alerts** - Notify users of high-risk app policies
6. **Mobile App** - React Native companion app
7. **API Access** - Allow third-party integrations

---

## 📄 License

This project is open source and available for personal and commercial use.
