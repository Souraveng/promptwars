# Tactical OS (Sentinel Edition)

Tactical OS is a high-fidelity, real-time event management and guest engagement platform designed for large-scale venues and high-security operations. It provides a unified "Sentinel" ecosystem for administrators to monitor events and operatives (guests) to navigate successfully.

## 📡 Core Feature Suite

### 1. Tactical Monitor (Admin Dashboard)
A comprehensive command center for venue oversight:
- **Sentinel Map Layer**: Integrated Google Maps view for outdoor perimeter tracking and real-time incident visualization.
- **Incident Control Hub**: Real-time stream of SOS and medical alerts with priority-based filtering and status triage.
- **Broadcast Console**: centralized hub for deploying millisecond-accurate alerts to specific zones or the entire venue population.
- **Venue physical Logic**: Interactive editors for indoor seating charts, gate configurations, and sectors.

### 2. Operative PWA (Guest Interface)
A mobile-optimized, offline-capable interface for guests:
- **Tactical Gateway**: Advanced QR scanner for instant credential verification and automated profile synchronization.
- **Digital Tactical Pass**: Encrypted credentials that display live sector data (Gate, Section, Row, Seat) with "Mission Data" collapsible UI.
- **Sentinel Lens (Layouts)**: High-performance indoor navigation system with interactive zooming, panning, and seat highlighting.
- **Emergency SOS Suite**: One-touch high-priority signaling with automatic location sharing for medical or tactical assistance.
- **Live Alert Stream**: Unified feed for real-time broadcasts, ranging from security notifications to community promotions.

### 3. AI & Intelligence Hub
Powered by **Gemini 1.5 Flash**:
- **Tactical Enhancement**: AI-driven text refinement for administrator broadcasts to ensure clarity and impact.
- **Promotional Copy**: Instant generation of premium marketing copy for community-wide alerts.
- **Automated Handshakes**: Intelligent data extraction during QR scanning for zero-effort operative onboarding.

---

## 🛠 Technology Stack

- **Core Framework**: [Next.js](https://nextjs.org) (App Router Architecture)
- **Data Layer**: [Firebase Data Connect (GDC)](https://firebase.google.com/docs/data-connect) for decentralized, real-time state management.
- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth) with multi-provider integration.
- **Maps Engine**: Hybrid integration of Google Maps API and Custom SVG Tactical Renderers.
- **AI Engine**: Google Generative AI SDK (`Gemini 1.5 Flash`).
- **Styling**: Vanilla CSS + "Sentinel" Design Tokens (Glassmorphism, High-Contrast Neon Accents).

---

## 🚀 Deployment Operations

### Cloud Environment
The project is optimized for **Google Cloud Platform (GCP)**:
- **Cloud Run**: Horizontal scaling for high-traffic event bursts.
- **Artifact Registry**: Automated CI/CD pipeline integration via Cloud Build.

### Environment Configuration
Ensure the following keys are configured in your `.env.local`:
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: For geospatial rendering.
- `GOOGLE_GENERATIVE_AI_API_KEY`: For the Intelligence Hub.
- `FIREBASE_DC_CONFIG`: For secure Data Connect handshakes.

---

## 📋 Getting Started

First, install dependencies:
```bash
npm install
```

Start the tactical environment:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the Portal.
