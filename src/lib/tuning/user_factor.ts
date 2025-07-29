// Personal factor corrections
export const userFactor = {
  gender: { M: { hz: 0.2, bpm: 0,   energy: 0.05, rhythm: 0.1 },
            F: { hz: -0.1, bpm: -2, energy: -0.05, rhythm: -0.05 } },

  ageGroup: {
    "10-20":  { hz: 0.3, bpm: 3,  energy: 0.15, rhythm: 0.2 },
    "21-30":  { hz: 0.1, bpm: 1,  energy: 0.10, rhythm: 0.1 },
    "31-40":  { hz: 0,   bpm: 0,  energy: 0,    rhythm: 0 },
    "41-50":  { hz: -0.1, bpm: -1, energy: -0.05, rhythm: -0.05 },
    "51-60":  { hz: -0.2, bpm: -2, energy: -0.10, rhythm: -0.1 },
    "61-70":  { hz: -0.3, bpm: -3, energy: -0.15, rhythm: -0.15 },
    "70+":    { hz: -0.4, bpm: -4, energy: -0.20, rhythm: -0.2 },
  },

  blood: {
    A:  { hz: 0.1, bpm: 1,  energy: 0.05, rhythm: 0.05 },
    B:  { hz: -0.1, bpm: -1, energy: -0.05, rhythm: -0.05 },
    AB: { hz: 0.2, bpm: 2,  energy: 0.10, rhythm: 0.1 },
    O:  { hz: 0,   bpm: 0,  energy: 0,    rhythm: 0 },
  },

  space: {
    "Indoor":  { hz: 0.0, bpm: 0,  energy: 0,    rhythm: 0 },
    "Outdoor": { hz: 0.2, bpm: 2,  energy: 0.10, rhythm: 0.1 },
  },

  device: {
    "Phone Speaker": { hz: 0.0, bpm: 0,  energy: 0,    rhythm: 0 },
    "Earphones":     { hz: 0.1, bpm: 0,  energy: 0.05, rhythm: 0.0 },
    "External Speaker": { hz: 0.2, bpm: 1,  energy: 0.10, rhythm: 0.05 },
  },
} as const;