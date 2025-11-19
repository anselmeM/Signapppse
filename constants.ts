import { AppView, Lesson } from './types';

export const MOCK_LESSONS: Lesson[] = [
  {
    id: '1',
    title: 'Alphabet A-E',
    difficulty: 'Beginner',
    duration: '5 min',
    xp: 50,
    thumbnail: 'https://picsum.photos/300/200?random=1',
    completed: true,
  },
  {
    id: '2',
    title: 'Common Greetings',
    difficulty: 'Beginner',
    duration: '8 min',
    xp: 75,
    thumbnail: 'https://picsum.photos/300/200?random=2',
    completed: false,
  },
  {
    id: '3',
    title: 'Emergency Signs',
    difficulty: 'Intermediate',
    duration: '12 min',
    xp: 120,
    thumbnail: 'https://picsum.photos/300/200?random=3',
    completed: false,
  },
  {
    id: '4',
    title: 'Coffee Shop Talk',
    difficulty: 'Beginner',
    duration: '10 min',
    xp: 100,
    thumbnail: 'https://picsum.photos/300/200?random=4',
    completed: false,
  }
];

export const SCENARIOS = [
  { id: 'cafe', name: 'Coffee Shop', icon: '☕' },
  { id: 'doctor', name: 'Doctor\'s Office', icon: '🩺' },
  { id: 'interview', name: 'Job Interview', icon: '💼' },
  { id: 'social', name: 'Social Event', icon: '🎉' },
];

// Mathematical Reference Model for ASL Signs
// Angles are in degrees calculated from Wrist -> MCP -> Tip.
// 180 = Fully Extended, 30 = Fully Curled/Fist
export const SIGN_REFERENCES: Record<string, {
  name: string;
  // [Thumb, Index, Middle, Ring, Pinky] angle targets
  vector: number[]; 
  // Allowed deviation (+/- degrees) for each finger to still be considered "correct"
  variance: number[];
  // Additional geometric constraints (e.g., thumb position relative to hand)
  constraints?: {
    thumbIndexProximity?: boolean; // If true, thumb tip must be close to index base
  }
}> = {
  'A': {
    name: 'Letter A',
    // Thumb Upright (Straight-ish > 140), Fingers Curled (< 50)
    vector: [150, 45, 45, 45, 45], 
    variance: [40, 45, 45, 45, 45],
    constraints: { thumbIndexProximity: true }
  },
  'B': {
    name: 'Letter B',
    // Thumb Tucked (< 100), Fingers Straight (> 160)
    vector: [80, 170, 170, 170, 170],
    variance: [50, 30, 30, 30, 30]
  },
  'C': {
    name: 'Letter C',
    // All fingers curved forward (~100-130)
    vector: [130, 110, 110, 110, 110],
    variance: [40, 40, 40, 40, 40]
  },
  'D': {
    name: 'Letter D',
    // Index Straight, others curled to touch thumb
    vector: [130, 170, 40, 40, 40],
    variance: [40, 30, 40, 40, 40]
  },
  'E': {
    name: 'Letter E',
    // All fingers curled tight, thumb tucked under
    vector: [30, 30, 30, 30, 30],
    variance: [30, 30, 30, 30, 30]
  },
  'F': {
    name: 'Letter F',
    // Index & Thumb circle, others straight
    vector: [120, 120, 170, 170, 170],
    variance: [40, 40, 30, 30, 30]
  },
  'I': {
    name: 'Letter I',
    // Pinky straight, others curled
    vector: [40, 40, 40, 40, 170],
    variance: [40, 40, 40, 40, 30]
  },
  'L': {
    name: 'Letter L',
    // Thumb & Index straight (L shape), others curled
    vector: [160, 170, 40, 40, 40],
    variance: [30, 30, 40, 40, 40]
  },
  'O': {
    name: 'Letter O',
    // All curved to form circle
    vector: [120, 120, 120, 120, 120],
    variance: [40, 40, 40, 40, 40]
  },
  'U': {
    name: 'Letter U',
    // Index & Middle straight together, others curled
    vector: [40, 170, 170, 40, 40],
    variance: [40, 30, 30, 40, 40]
  },
  'V': {
    name: 'Letter V',
    // Index & Middle straight spread, others curled
    vector: [40, 170, 170, 40, 40],
    variance: [40, 30, 30, 40, 40]
  },
  'W': {
    name: 'Letter W',
    // Index, Middle, Ring straight, Pinky curled
    vector: [40, 170, 170, 170, 40],
    variance: [40, 30, 30, 30, 40]
  },
  'Y': {
    name: 'Letter Y',
    // Thumb & Pinky straight, others curled
    vector: [160, 40, 40, 40, 170],
    variance: [30, 40, 40, 40, 30]
  }
};