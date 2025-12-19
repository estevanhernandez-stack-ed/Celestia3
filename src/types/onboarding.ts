export interface OnboardingBirthInfo {
  date: string;
  time: string;
  location: string;
  lat?: number;
  lng?: number;
}

export interface OnboardingPlanetData {
  name: string;
  sign: string;
  degree: number;
  house: number;
  interpretation: string;
  color: string;
  distance: number;
  size: number;
  retrograde?: boolean;
}

export interface OnboardingChartData {
  planets: OnboardingPlanetData[];
  ascendant: string;
  summary: string;
}

export interface CameraState {
  target: [number, number, number];
  position: [number, number, number];
  lookingAt: string | null;
}
