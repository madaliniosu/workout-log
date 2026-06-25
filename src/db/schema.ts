import {
  pgTable,
  uuid,
  text,
  integer,
  real,
  timestamp,
  primaryKey,
  boolean,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const exercises = pgTable('exercises', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  muscleGroup: text('muscle_group'),
  userId: uuid('user_id').references(() => users.id), // null = global exercise, set = user's custom one
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const workoutSessions = pgTable('workout_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  date: timestamp('date').defaultNow().notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const workoutSets = pgTable('workout_sets', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => workoutSessions.id, { onDelete: 'cascade' }),
  exerciseId: uuid('exercise_id')
    .notNull()
    .references(() => exercises.id, { onDelete: 'cascade' }),
  setOrder: integer('set_order').notNull(),
  reps: integer('reps').notNull(),
  weight: real('weight').notNull(),
  rpe: real('rpe'),
});

export const hiddenExercises = pgTable(
  'hidden_exercises',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.exerciseId] })],
);

export const exerciseDimensions = pgTable(
  'exercise_dimensions',
  {
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'cascade' }),
    dimension: text('dimension').notNull(),
  },
  (table) => [primaryKey({ columns: [table.exerciseId, table.dimension] })],
);

export const workoutTemplates = pgTable('workout_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  name: text('name').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const workoutTemplateExercises = pgTable('workout_template_exercises', {
  id: uuid('id').defaultRandom().primaryKey(),
  templateId: uuid('template_id')
    .notNull()
    .references(() => workoutTemplates.id, { onDelete: 'cascade' }),
  exerciseId: uuid('exercise_id')
    .notNull()
    .references(() => exercises.id, { onDelete: 'cascade' }),
  setCount: integer('set_count').notNull(),
  exerciseOrder: integer('exercise_order').notNull(),
});

export const scheduledWorkouts = pgTable('scheduled_workouts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  templateId: uuid('template_id').references(() => workoutTemplates.id, {
    onDelete: 'set null',
  }),
  name: text('name').notNull(),
  scheduledAt: text('scheduled_at').notNull(), // 'YYYY-MM-DDTHH:mm', naive local time, never UTC-converted
  completed: boolean('completed').notNull().default(false),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const scheduledWorkoutExercises = pgTable(
  'scheduled_workout_exercises',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    scheduledWorkoutId: uuid('scheduled_workout_id')
      .notNull()
      .references(() => scheduledWorkouts.id, { onDelete: 'cascade' }),
    exerciseId: uuid('exercise_id').references(() => exercises.id, {
      onDelete: 'set null',
    }),
    exerciseName: text('exercise_name').notNull(),
    setCount: integer('set_count').notNull(),
    exerciseOrder: integer('exercise_order').notNull(),
  },
);

export const completedSets = pgTable('completed_sets', {
  id: uuid('id').defaultRandom().primaryKey(),
  scheduledWorkoutId: uuid('scheduled_workout_id')
    .notNull()
    .references(() => scheduledWorkouts.id, { onDelete: 'cascade' }),
  exerciseId: uuid('exercise_id').references(() => exercises.id, {
    onDelete: 'set null',
  }),
  exerciseName: text('exercise_name').notNull(),
  setNumber: integer('set_number').notNull(),
  dimension: text('dimension').notNull(),
  value: real('value').notNull(),
});
