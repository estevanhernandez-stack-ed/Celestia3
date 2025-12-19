export const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export const CONSTELLATION_RADIUS = 150;

export const PLANET_CONFIGS: Record<string, { color: string; size: number; baseDistance: number }> = {
  "Sun": { color: "#FFD700", size: 3.0, baseDistance: 0 },
  "Moon": { color: "#F5F5F5", size: 1.2, baseDistance: 12 },
  "Mercury": { color: "#A9A9A9", size: 1.0, baseDistance: 18 },
  "Venus": { color: "#E9967A", size: 1.5, baseDistance: 28 },
  "Mars": { color: "#FF4500", size: 1.3, baseDistance: 38 },
  "Jupiter": { color: "#DAA520", size: 2.5, baseDistance: 54 },
  "Saturn": { color: "#F4A460", size: 2.2, baseDistance: 70 },
  "Uranus": { color: "#AFEEEE", size: 1.8, baseDistance: 85 },
  "Neptune": { color: "#4169E1", size: 1.8, baseDistance: 98 },
  "Pluto": { color: "#DCDCDC", size: 0.8, baseDistance: 110 },
};

export const HOUSE_COLORS = [
  "#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#B088F9", "#FF9F45",
  "#F76E11", "#FC4F4F", "#FF78F0", "#38E54D", "#2192FF", "#9C2C77"
];

export const CONSTELLATION_DATA: Record<string, { stars: [number, number, number][]; lines: [number, number][] }> = {
  "Aries": {
    stars: [[0, 0, 0], [4, 2, 0], [8, 1, 0], [10, -2, 0]],
    lines: [[0, 1], [1, 2], [2, 3]]
  },
  "Taurus": {
    stars: [[0, 0, 0], [2, 3, 0], [4, 6, 0], [2, -2, 0], [4, -4, 0], [-3, 5, 0], [-6, 10, 0]],
    lines: [[0, 1], [1, 2], [0, 3], [3, 4], [1, 5], [5, 6]]
  },
  "Gemini": {
    stars: [[0, 0, 0], [3, 10, 0], [6, 0, 0], [9, 10, 0], [0, 5, 0], [6, 5, 0]],
    lines: [[0, 4], [4, 1], [1, 3], [3, 5], [5, 2], [2, 0]]
  },
  "Cancer": {
    stars: [[0, 0, 0], [2, 3, 0], [4, 1, 0], [6, -2, 0], [4, 6, 0]],
    lines: [[0, 1], [1, 2], [2, 3], [1, 4]]
  },
  "Leo": {
    stars: [[0, 0, 0], [5, 0, 0], [7, 4, 0], [4, 8, 0], [0, 6, 0], [-3, 3, 0], [-3, 1, 0]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 5], [5, 6]]
  },
  "Virgo": {
    stars: [[0, 0, 0], [4, -2, 0], [8, 0, 0], [6, 4, 0], [3, 6, 0], [-2, 3, 0], [-5, 0, 0]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0]]
  },
  "Libra": {
    stars: [[0, 0, 0], [3, 5, 0], [6, 0, 0], [3, -5, 0]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0]]
  },
  "Scorpio": {
    stars: [[0, 0, 0], [-2, 2, 0], [-2, 4, 0], [3, -2, 0], [6, -5, 0], [9, -4, 0], [11, -1, 0]],
    lines: [[0, 1], [1, 2], [0, 3], [3, 4], [4, 5], [5, 6]]
  },
  "Sagittarius": {
    stars: [[0, 0, 0], [3, 3, 0], [6, 0, 0], [3, -3, 0], [-3, 2, 0], [-5, 5, 0], [-7, 2, 0]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [4, 5], [5, 6], [6, 4]]
  },
  "Capricorn": {
    stars: [[0, 0, 0], [5, 2, 0], [10, 0, 0], [8, -5, 0], [3, -4, 0]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]
  },
  "Aquarius": {
    stars: [[0, 0, 0], [-3, 2, 0], [-6, 5, 0], [2, -3, 0], [5, -6, 0], [8, -4, 0]],
    lines: [[0, 1], [1, 2], [0, 3], [3, 4], [4, 5]]
  },
  "Pisces": {
    stars: [[0, 0, 0], [3, 2, 0], [6, 5, 0], [9, 8, 0], [-3, 4, 0], [-6, 8, 0], [-9, 12, 0]],
    lines: [[0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 6]]
  }
};
