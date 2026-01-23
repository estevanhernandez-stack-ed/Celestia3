
export interface BirthInfo {
  date: string;
  time: string;
  location: string;
  lat?: number;
  lng?: number;
}

export interface PlanetData {
  name: string;
  sign: string;
  degree: number;
  house: number;
  interpretation: string;
  color: string;
  distance: number;
  size: number;
}

export interface NatalChartData {
  planets: PlanetData[];
  ascendant: string;
  summary: string;
}

export interface CameraState {
  target: [number, number, number];
  position: [number, number, number];
  lookingAt: string | null;
}
