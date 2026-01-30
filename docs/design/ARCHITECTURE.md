# 🏗️ System Architecture: Celestia 3 🌌🧪

Celestia 3 is a hybrid cloud-native application that orchestrates ancient esoteric logic with state-of-the-art Generative AI. 

## 📐 Conceptual Model

```mermaid
graph TD
    User((User)) --> Client[Next.js Frontend]
    Client --> Context[Settings & Auth State]
    
    subgraph "AI Mesh"
    Context --> SDK[Technomancer AI: Direct SDK]
    SDK --> Tools[Function Calling: Resonance/Spotify]
    Client --> Proxy[Athanor AI: Cloud Proxy]
    Proxy --> Secret[Secret Manager: API Key]
    Secret --> G3[Gemini API]
    end
    
    subgraph "Logic Layer"
    Client --> Swiss[Swiss Ephemeris WASM]
    Client --> Arith[Arithmancy Engine]
    Swiss --> Astro[Astro Calculations]
    end
    
    subgraph "Persistence"
    Context --> Firestore[(Firestore DB)]
    Firestore --> SubCol[Subcollections: Profile/Grimoire]
    end
```

---

## 🦾 Component Breakdown

### 1. The Hybrid AI Mesh
To ensure security and power, we utilize two distinct AI pathways:
- **Technomancer (Direct):** Uses the client-side SDK for **Function Calling**. This allows "The Architect" to interact with browser APIs like Web Audio for rituals.
- **Athanor (Proxy):** Routes standard chat and generative tasks through a Firebase Cloud Function. This protects API keys and enforces server-side rate limits (20 req/min).

### 2. Ethereal WASM Bridge
Astrological precision is achieved via the `Swiss Ephemeris`, compiled to WebAssembly (WASM).
- **Communication:** Uses a direct memory bridge to fetch planetary longitude and house cusps from the C core.
- **Aspect Engine:** A separate TypeScript layer that calculates geometric relationships (squares, trines) between natal and transit coordinates.

### 3. State & Persistence
- **Local-First:** The app remains functional in "Guest Mode" using `localStorage` for temporary state.
- **Firestore Sync:** Authenticated sessions use `UserProfileService` to bidirectionally sync preferences, leveling, and the Grimoire.

---

## 🛡️ Security Architecture
- **Identity:** Managed via Firebase Auth.
- **Verification:** Firebase App Check (reCAPTCHA Enterprise) protects the Cloud Proxy from non-browser traffic.
- **Secrets:** API keys are never bundled in the frontend; they reside exclusively in **Google Cloud Secret Manager**.

---

## 📈 Progression & Logic
Access to advanced features (e.g., Synastry, Rituals) is gated by the `ProgressionService`.
- **XP Hooks:** Every significant interaction (reading, ritual, scan) triggers a server-side verified or client-calculated XP gain.
- **Level Gates:** Defined in `src/lib/ProgressionService.ts`, ensuring a curated user journey.

---

## 🏛️ Technical Rationale: Why Function Calling?

The decision to expose browser APIs to the AI via **Function Calling** (Tool Use) is central to the project's agentic goals. 

### 1. Deterministic Execution vs Hallucination
When the AI describes a "Solar Resonance," it must be exact. By using a tool-calling layer for `trigger_resonance`, we ensure the frequency is mathematically correct (e.g., 126.22 Hz) rather than the AI simply "imagining" a sound. 

### 2. The "Active OS" Metaphor
We treat the application state as a register that the AI can read/write.
- **`scryCelebrity`**: Acts as a dynamic data-injection routine. It allows the AI to hydrate the application's historical database (`CELEBRITIES`) without a deployment.
- **`search_spotify`**: Bridges the digital sandbox with the real-world cultural layer, manifesting the AI's abstract synthesis into a concrete user experience.

### 3. Latency & Interaction Design
By using the **Direct SDK** for tools, we achieve sub-second execution for ritual elements. The "Technomancer" path handles the immediate somatic feedback (audio/visual), while the "Athanor" path handles high-context synthesis, creating a balanced, low-latency agentic loop.
