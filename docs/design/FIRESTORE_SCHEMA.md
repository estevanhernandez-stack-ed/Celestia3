# 📊 Firestore Schema: Celestia 3 🌌🧪

This document defines the data structures and relationships within the Celestia 3 Firestore database.

## 🧱 Collections Overview

| Collection | Scope | Purpose |
|------------|-------|---------|
| `v3_users` | Root | Main user records and sub-collections. |
| `v3_rate_limits` | Root | Server-side tracking for AI request management. |

---

## 👤 User Profiles
**Path:** `v3_users/{userId}/profile/preferences`

The primary document for user state, preferences, and progression.

```typescript
interface UserPreferences {
  name: string;           // Display Name
  birthDate: ISO_DATE;    // YYYY-MM-DD
  birthLocation: {
    lat: number;
    lng: number;
    city: string;
  };
  xp: number;             // Current Experience Points
  level: number;          // Ascension Level (1-99)
  intent: 'General' | 'Love' | 'Career' | 'Growth';
  customCelebrities: Celebrity[]; // Scryed icons added to collection
  savedCharts: SynastryChart[];   // Historical compatibility reports
  chartAnalysis: {        // AI-generated natal summary
    story: string;
    bigThree: string;
  };
}
```

---

## 📜 The Grimoire (Journal & Records)
**Path:** `v3_users/{userId}/grimoire/{entryId}`

A collection of spiritual artifacts, readings, and rituals.

### Entry Types
- **`ritual`**: Vision outputs, paradigm used, and intent.
- **`tarot`**: Card spread data, question asked, and interpretation.
- **`aura`**: Analysis text, procedural colors, and location data.
- **`deep-dive`**: Oracle inquiry and the poetic response.

```typescript
interface GrimoireEntry {
  userId: string;
  type: 'ritual' | 'tarot' | 'aura' | 'deep-dive';
  title: string;
  content: Record<string, any>;
  tags: string[];
  date: Timestamp;
}
```

---

## 🛡️ Rate Limits
**Path:** `v3_rate_limits/{userId}`

Used by the `geminiProxy` to prevent API abuse.

```typescript
interface RateLimit {
  count: number;        // Requests made in current window
  windowStart: number;  // Epoch MS of window start
}
```

---

## 🗺️ Data Security (Rules)
- **User Privacy**: `allow read, write: if request.auth.uid == userId;`
- **Global Config**: `allow read: if true;`
- **Rate Limits**: `allow read: if request.auth.uid == userId;` (Write restricted to Cloud Functions).
