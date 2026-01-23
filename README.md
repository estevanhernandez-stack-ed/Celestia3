# Celestia 3: The Astro-Numerical Nexus

Celestia 3 is a premium, cosmic-themed web application that synthesizes ancient wisdom with modern artificial intelligence. It provides users with a deep, personalized exploration of kanilang astrological and numerological signatures, powered by the **Gemini 3 Pro Preview** model.

## 🌟 Core Features

- **Natal Compass**: A real-time, interactive visualization of your planetary positions at birth, including Sabian Symbol analysis and House placements.
- **Arithmancy Engine**: Advanced numerology calculations (Life Path, Destiny, Soul Urge) using customized Pythagorean and Chaldean algorithms.
- **Chronos Feed**: Real-time transit monitoring that overlays current planetary movements onto your natal chart to identify active temporal triggers.
- **Synastry & Synergy**: Deep compatibility analysis using bi-wheel overlays and AI-driven resonance reports.
- **Ritual Vision**: A procedural ritual engine that combines intention-setting with generative visual and textual "visions."
- **Aura Scanner**: Gemini Vision-powered aura analysis using your device's camera.
- **Cosmic Codex**: A vast, interactive library of ethereal knowledge and astrological archetypes.

## 🛠 Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, Framer Motion
- **AI**: Google Gemini 3 Pro Preview (Direct & Proxy-mediated)
- **Backend & Persistence**: Firebase (Auth, Firestore, Hosting, Secrets, Cloud Functions)
- **Astrology Engine**: Swiss Ephemeris (via `swiss-ephemeris` WASM/Service)
- **Security**: Firebase App Check (reCAPTCHA Enterprise), User Rate Limiting

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Firebase Project
- Google Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/estevanhernandez-stack-ed/Celestia3.git
   ```

2. Install dependencies:
   ```bash
   cd app
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the `app` directory with your Firebase and Gemini credentials.

4. Run the development server:
   ```bash
   npm run dev
   ```

## 📜 Legal

Refer to the `/terms` and `/privacy` routes for the Terms of Service and Privacy Policy.

---

*Part of the 2026 Technomancy Hackathon.*
