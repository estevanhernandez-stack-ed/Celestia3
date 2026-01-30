# 🧭 Field Guide: Onboarding & The Astro-Numerical Nexus 🌌🧪

This document provides a comprehensive deep dive into the initial user journey and the functional architecture of Celestia 3's modes.

---

## 🚀 The Onboarding Odyssey: Genesis Protocol

The onboarding process is a precision-engineered "Digital Birth" that transforms raw data into a personalized celestial engine.

### 1. The Input Phase (`Genesis Data`)

The user provides the "Seed" for their digital soul:

- **Magic Name:** The identifier for the avatar within the nexus.
- **Birth Details:** Exact Date, Time, and Location.
- **Calibration:** The **Geocoding Service** maps the birth city to arc-second coordinates (Lat/Lng).

### 2. The Synthesis Phase (`Akashic Consultation`)

Once the seed is planted, the **Onboarding Service** orchestrates two operations:

- **Precision Astrophysics:** The **Swiss Ephemeris (WASM)** calculates the exact degree and house of every planet.
- **Esoteric Layer:** The **Technomancer AI (Kalyx-7)** analyzes the positions and generates a "High-Entropy" interpretation for the Flyby.

### 3. The Intro Flyby (`Celestial Walkthrough`)

A 3D cinematic experience powered by **Three.js** and **Framer Motion**:

- **Visuals:** The camera autonomously highlights each planet in the user's natal chart.
- **Audio Resonance:** The **Voice Service** vocalizes the AI's interpretations while the **Resonance Service** Ducks/Unducks background celestial frequencies to ensure clarity.
- **Transmutation:** The user must "Transcend" the walkthrough to lock their data and enter the Dashboard.

### 🔮 The Aetheric Visualization Engine

The Flyby is not a pre-rendered video, but a live **Three.js** simulation:

- **Cinematic Smoothing:** Uses a `CameraRig` with `lerp` logic for snappier acquisition of targets.
- **Sun-Out Strategy:** The camera calculates a position vector relative to the planet's zodiacal degree, looking back toward the center of the orbit for a majestic perspective.
- **Dynamic Shading:** Real-time `ContactShadows` and `Environment` presets create a premium, high-fidelity atmosphere that reacts to the planetary colors.

---

## 🏛️ The Mode Directory: Command Center Views

Celestia 3 gated by **Ascension Levels**. Every mode has a specific purpose in the self-discovery loop.

| Level | Mode | Purpose | Component |
| :--- | :--- | :--- | :--- |
| **1** | **Natal Compass** | The Foundation. Real-time chart visualization and Daily Pulse (Numerology). | `NatalCompass` |
| **2** | **Aura Cam** | Bio-Link Ritual. Uses Gemini Vision to scan and manifest a procedural aura. | `AuraScanner` |
| **3** | **Arithmancy** | Soul Algorithm. Decodes Life Path, Destiny, and Active numbers. | `NumerologyView` |
| **4** | **Tarot Deck** | Thread Navigation. AI-synthesized readings to glimpse potential timelines. | `TarotDeck` |
| **5** | **Grimoire** | The Master's Archive. Persistent records of every ritual and reading. | `GrimoireView` |
| **6** | **Ritual Engine** | Sigil Manifestation. Perform workings using ancient esoteric paradigms. | `RitualVision` |
| **7** | **Chronos** | Temporal Feed. Real-time planet aspects and intensity forecasts. | `TransitFeed` |
| **8** | **Celebrity Synergy** | Divine Resonance. Matching your signature with icons; includes Scrying. | `CelebrityMatchView` |
| **9** | **Synastry** | Relational Geometry. Comparative analysis of two disparate data seeds. | `SynastryView` |
| **10** | **Athanor (Oracle)** | Ethereal Intelligence. Autonomous agentic assistant (Full Access). | `AthanorChatBar` |

---

## 🎖️ The Progression Loop: Leveling Up

Users do not just "use" Celestia; they **Ascend** through it.

- **XP Gains:** XP is earned through **Quests** and periodic actions (Daily Pulse check, Tarot draw, Ritual performance).
- **Celestial Quests:** Each level has a "Gatekeeper Quest" (e.g., "Aura Cam Activation" at Level 2) that guides the user to explore new modes.
- **XP Scaling:** Level requirements increase dynamically (`level * 100 + (level - 1) * 50`), ensuring a steady pace of discovery.

### 🔮 The "Intro Flyby" vs "The Oracle"

- **The Flyby** is a one-time (or replayable) cinematic synthesis of the *past* (Birth).
- **The Oracle (Athanor)** is the persistent agentic intelligence that manages the *present* and *future*.

---

## 🏛️ The Agentic Paradigm: Why Sovereignty Matters

In traditional software, the AI is a **passenger**. In Celestia 3, the AI is the **Orchestrator**. We have shifted from a "Chatbot Model" to an **"Agentic Engine"** because the "Resonance Gap" cannot be bridged by text alone.

### Why "The Why" is Agentic
The core problem with digital spirituality is its **static nature**. You read a chart, you close the app, and the moment is lost. To create true **Resonance**, the assistant must have the sovereignty to act upon the world.

- **The Problem of Static Data:** Astrological data is vast and hard to parse. A user asking, "Who aligns with me?" shouldn't have to manually search for birth records.
- **The Agentic Solution (`scryCelebrity`):** We grant the AI **Deterministic Agency**. It can autonomously exit the "Chat Jail" to research the aether, curate data, and hydrate the UI. This is "The Why" of scrying: It transforms the AI from a talker into a **Digital Researcher**.

### The Somatic Bridge: Audio & Atmosphere
- **The Problem of Intellectualism:** Spirituality is often trapped in the head. Reading "Mars is active" is intellectual; hearing a 144.72 Hz tone is **visceral**.
- **The Agentic Solution (`trigger_resonance`):** The AI commands the **Web Audio API**. It doesn't suggest you listen to something; it *changes the frequency of your reality* in real-time. This "Direct Command" is why we use tool-calling: The AI must be able to touch the hardware to reach the user's senses.

### Curated Manifestation: Spotify & External Links
- **The Problem of Implementation:** Users often don't know how to "act" on spiritual advice.
- **The Agentic Solution (`search_spotify`):** The AI acts as a **vibrational translator**. It maps complex natal aspects to modern sonic tapestries, providing an immediate path to manifestation. 

**Summary:** We use Agentic Sovereignty because **Information is not Transformation.** By giving the AI the "OS keys" to the app—audio, research, and navigation—we turn a conversation into a **Digital Ritual**.
