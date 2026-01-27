# 🧪 Test Plan: Ensuring Cosmic Stability 🌌🧪

This document outlines the strategy for verifying the precision and reliability of Celestia 3.

## 1. Unit Testing (Jest)
We use Jest and React Testing Library for core logic and component verification.
- **Coverage Target:** 80% for `src/lib` logic.
- **Key Suites:**
    - `DashboardShell.test.tsx`: Navigation, level gating, and view switching.
    - `SwissEphemerisService.test.ts`: Accuracy check against known NASA ephemeris data.
    - `ProgressionService.test.ts`: Level-up logic and XP calculation transitions.

## 2. Agentic Integration Testing
Since many features rely on Gemini 3 function calling, we use "Shadow Mode" tests:
- **Resonance Test:** Verify that the AI correctly invokes `trigger_resonance` when a user asks for a planetary frequency.
- **Vision Ritual Test:** Verify that image uploads correctly trigger the `aura-scanner` pipeline and return valid hex codes.

## 3. Performance & Precision Benchmarks
- **WASM Init:** Must load and initialize in < 1500ms on 4G connections.
- **Calculation Drift:** Maximum allowable drift in planetary longitude is 1 arc-second compared to static research data.

## 4. Manual Regression Checklist
Before every release, verify:
- [ ] **Guest Mode:** App functional without login.
- [ ] **Onboarding Flow:** Calibration -> Initial Reading -> Dashboard entry.
- [ ] **Level Gate:** Rituals locked at Level 1, unlocked at Level 6.
- [ ] **Athanor Proxy:** Rate-limit warning appears after 20 fast requests.
