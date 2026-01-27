# 🔌 Technical Service Directory: Celestia 3 🌌🧪

This document serves as a reference for the core TypeScript services located in `src/lib`.

## 🛠️ Global Orchestration

| Service | Primary Responsibility | Key Method |
|---------|------------------------|------------|
| `ConfigService` | Global AI Persona & Directives | `getGlobalDirective()` |
| `ChatService` | Athanor Oracle orchestration | `sendMessage()` |
| `gemini.ts` | AI Mesh (Direct & Proxy) | `technomancerModel.generateContent()` |

---

## 🧭 Astrology & Mathematics

### `SwissEphemerisService`
The core engine for celestial coordinates.
- **`calculateChart(date, lat, lng)`**: returns `NatalChartData`.

### `ResonanceService`
Orchestrates planetary frequencies.
- **`triggerResonance(planet)`**: executes Web Audio oscillator sweeps based on planetary harmonics.

---

## 👤 User & Progression

### `UserProfileService`
Syncs the user's soul record to the cloud.
- **`saveProfile(uid, prefs)`**: persists to Firestore and localStorage.
- **`loadProfile(uid)`**: retrieves newest data with conflict resolution.

### `ProgressionService`
Calculates XP and Level milestones.
- **`addXP(prefs, action)`**: processes game loop logic and returns new Level status.

---

## 🎨 Creative & Vision

### `RitualService`
Generates procedural visions.
- **`generateRitual(intent, paradigm)`**: AI-powered manifestation logic.

### `CelebrityService`
Astral icons and scrying.
- **`scryCelebrity(query)`**: AI-powered discovery of historical birth coordinates.

---

## 🛡️ Utilities

### `PersistenceService`
Handles session-specific state and chat history.
- **`saveAthanorHistory(history)`**: Stores ephemeral oracle interaction.

### `GeocodingService`
Maps human locations to coordinates.
- **`searchLocations(query)`**: Photon-based geocoding.
