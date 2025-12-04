export enum Phase {
  TERRESTRIAL = "Terrestrial & Atmospheric",
  ORBITAL = "Orbital & Interplanetary",
  FUSION = "The Fusion Frontier",
  RELATIVISTIC = "Relativistic Distortion",
  HARD_RELATIVISTIC = "Hard Relativistic Regime",
  ASYMPTOTE = "The Asymptote"
}

export interface Milestone {
  speed: number; // m/s
  label: string;
  description: string;
}

export interface Star {
  x: number;
  y: number;
  z: number;
  baseColor: { r: number, g: number, b: number };
  size: number;
}

export interface SimulationState {
  velocity: number; // m/s
  beta: number; // v/c ratio (0 to nearly 1)
  gamma: number; // Lorentz factor
  phase: Phase;
  distanceTraveled: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}