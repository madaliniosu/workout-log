import { db } from './index';
import { exercises } from './schema';

const defaultExercises = [
  { name: 'Bench Press', muscleGroup: 'Chest', category: 'Strength' },
  { name: 'Squat', muscleGroup: 'Legs', category: 'Strength' },
  { name: 'Deadlift', muscleGroup: 'Back', category: 'Strength' },
  { name: 'Overhead Press', muscleGroup: 'Shoulders', category: 'Strength' },
  { name: 'Pull-up', muscleGroup: 'Back', category: 'Strength' },
  { name: 'Barbell Row', muscleGroup: 'Back', category: 'Strength' },
  { name: 'Bicep Curl', muscleGroup: 'Arms', category: 'Strength' },
  { name: 'Tricep Extension', muscleGroup: 'Arms', category: 'Strength' },
  { name: 'Leg Press', muscleGroup: 'Legs', category: 'Strength' },
  { name: 'Plank', muscleGroup: 'Core', category: 'Flexibility' },
];


async function seed() {
  await db.insert(exercises).values(defaultExercises);
  console.log(`Seeded ${defaultExercises.length} exercises`);
}

seed();