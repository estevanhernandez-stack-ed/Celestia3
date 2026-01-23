# 🛠 Technical Architecture: Celestia 3

Celestia 3 is a production-grade spiritual-technical nexus built on a hybrid AI-Cloud architecture. This document outlines the engineering decisions that make the "Astro-Numerical Nexus" possible.

## 🧠 Gemini 3 Integration Model

We utilize a **Hybrid Mesh** to balance performance, security, and advanced capabilities:

1.  **Direct SDK (Technomancer Core)**:
    - **Usage**: Advanced chat interactions involving **Function Calling (Tools)**.
    - **Capabilities**: The AI can autonomously `trigger_resonance` (Web Audio), `search_spotify`, or query ethereal knowledge.
    - **Security**: Protected by mandatory Firebase Authentication checks.

2.  **Cloud Proxy (Athanor Bridge)**:
    - **Usage**: High-frequency text generation and standard rituals.
    - **Architecture**: Client makes a request to a Firebase Cloud Function -> Proxy validates user rate limits -> Proxy retrieves `GEMINI_API_KEY` from **Firebase Secret Manager** -> Proxy executes request to Google AI.
    - **Benefits**: Zero exposure of API keys on the frontend and global rate limiting (20 requests/minute/user).

## 🌌 Cosmic Logic Engines

### 1. Arithmancy (Numerology)
A custom-built TypeScript engine that calculates:
- **Daily Pulse**: Periodically computed resonance based on birth data.
- **Destiny Threads**: Life path and expression number derivations.

### 2. Natal Compass (Swiss Ephemeris)
Integrates the `swiss-ephemeris` library via WASM.
- **Precision**: Calculates planetary longitudes, house cusps, and aspects with arc-second accuracy.
- **Bi-Wheels**: Dynamic Synastry generation by mapping two disparate celestial datasets onto a single concentric coordinate system.

## 🛡 Security & Scalability

- **Firebase App Check**: Implemented with reCAPTCHA Enterprise to prevent bot abuse of AI services.
- **Persistence Layer**: Real-time Firestore synchronization for authenticated users, with a local-first failover for Guest sessions.
- **Progression Service**: A secure, server-side-ready logic gate that controls feature access based on XP and Level milestones.

## 🚀 Future Roadmap
- **Decentralized Chronicle**: Moving user journals to encrypted IPFS storage.
- **Aura-Procedural Models**: Fine-tuning Gemini models on esoteric datasets (Hermeticism, Vedic Astrology).
