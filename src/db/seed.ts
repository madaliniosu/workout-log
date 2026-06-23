import { db } from './index';
import { exercises } from './schema';

const defaultExercises = [
  { name: 'Bench Press', muscleGroup: 'Chest' },
  { name: 'Squat', muscleGroup: 'Legs' },
  { name: 'Deadlift', muscleGroup: 'Back' },
  { name: 'Overhead Press', muscleGroup: 'Shoulders' },
  { name: 'Pull-up', muscleGroup: 'Back' },
  { name: 'Barbell Row', muscleGroup: 'Back' },
  { name: 'Bicep Curl', muscleGroup: 'Arms' },
  { name: 'Tricep Extension', muscleGroup: 'Arms' },
  { name: 'Leg Press', muscleGroup: 'Legs' },
  { name: 'Plank', muscleGroup: 'Core' },
];

async function seed() {
  await db.insert(exercises).values(defaultExercises);
  console.log(`Seeded ${defaultExercises.length} exercises`);
}

seed();