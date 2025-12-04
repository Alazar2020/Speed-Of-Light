import { Phase, Milestone } from './types';

export const C = 299792458; // Speed of light in m/s

export const MILESTONES: Milestone[] = [
  { speed: 10, label: "Human Limit", description: "Top speed of a human sprinter (Usain Bolt)." },
  { speed: 120, label: "Top Fuel Dragster", description: "Intense acceleration blurring the foreground." },
  { speed: 343, label: "Mach 1 (Sound Barrier)", description: "Shockwave cone forms. Sound trails behind." },
  { speed: 1000, label: "Mach 3 (SR-71)", description: "High altitude reconnaissance speed." },
  { speed: 7660, label: "ISS Orbital Speed", description: "Continuous freefall around Earth." },
  { speed: 11200, label: "Escape Velocity", description: "Speed required to leave Earth's gravity." },
  { speed: 16999, label: "Voyager 1", description: "Fastest probe leaving the solar system." },
  { speed: 190000, label: "Parker Solar Probe", description: "Fastest man-made object (gravity assist)." },
  { speed: C * 0.05, label: "0.05c (Fusion)", description: "Transition to theoretical nuclear pulse propulsion." },
  { speed: C * 0.1, label: "0.1c (distortion starts)", description: "Star motion becomes noticeable." },
  { speed: C * 0.5, label: "0.5c (Hard Relativistic)", description: "Visual field distorts noticeably." },
  { speed: C * 0.866, label: "0.866c (Time Half)", description: "Time runs at 50% normal rate (Gamma = 2)." },
  { speed: C * 0.99, label: "0.99c", description: "Extreme aberration and Doppler shift." },
  { speed: C * 0.999, label: "The Asymptote", description: "The universe collapses to a point." },
];

export const getPhase = (v: number): Phase => {
  if (v < 343 * 10) return Phase.TERRESTRIAL;
  if (v < C * 0.0005) return Phase.ORBITAL;
  if (v < C * 0.1) return Phase.FUSION;
  if (v < C * 0.5) return Phase.RELATIVISTIC;
  if (v < C * 0.999) return Phase.HARD_RELATIVISTIC;
  return Phase.ASYMPTOTE;
};