import { pgTable, uuid, text, integer, real, timestamp, primaryKey, foreignKey, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

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
  (table) => [primaryKey({ columns: [table.userId, table.exerciseId] })]
);

export const exerciseDimensions = pgTable(
  'exercise_dimensions',
  {
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'cascade' }),
    dimension: text('dimension').notNull(),
  },
  (table) => [primaryKey({ columns: [table.exerciseId, table.dimension] })]
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
  exerciseId: uuid('exercise_id').references(() => exercises.id, { onDelete: 'set null' }),
  exerciseName: text('exercise_name').notNull(),
  setCount: integer('set_count').notNull(),
  exerciseOrder: integer('exercise_order').notNull(),
});

export const workoutTemplateExerciseTargets = pgTable(
  'workout_template_exercise_targets',
  {
    workoutTemplateExerciseId: uuid('workout_template_exercise_id').notNull(),
    dimension: text('dimension').notNull(),
    targetValue: real('target_value').notNull(),
  },
  (table) => [
    primaryKey({
      name: 'workout_template_exercise_targets_pk',
      columns: [table.workoutTemplateExerciseId, table.dimension],
    }),
    foreignKey({
      name: 'workout_template_exercise_targets_fk',
      columns: [table.workoutTemplateExerciseId],
      foreignColumns: [workoutTemplateExercises.id],
    }).onDelete('cascade'),
  ]
);

export const scheduledWorkouts = pgTable('scheduled_workouts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  templateId: uuid('template_id').references(() => workoutTemplates.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  scheduledAt: text('scheduled_at').notNull(), // 'YYYY-MM-DDTHH:mm', naive local time, never UTC-converted
  completed: boolean('completed').notNull().default(false),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const scheduledWorkoutExercises = pgTable('scheduled_workout_exercises', {
  id: uuid('id').defaultRandom().primaryKey(),
  scheduledWorkoutId: uuid('scheduled_workout_id')
    .notNull()
    .references(() => scheduledWorkouts.id, { onDelete: 'cascade' }),
  exerciseId: uuid('exercise_id').references(() => exercises.id, { onDelete: 'set null' }),
  exerciseName: text('exercise_name').notNull(),
  setCount: integer('set_count').notNull(),
  exerciseOrder: integer('exercise_order').notNull(),
});

export const scheduledWorkoutExerciseTargets = pgTable(
  'scheduled_workout_exercise_targets',
  {
    scheduledWorkoutExerciseId: uuid('scheduled_workout_exercise_id').notNull(),
    dimension: text('dimension').notNull(),
    targetValue: real('target_value').notNull(),
  },
  (table) => [
    primaryKey({
      name: 'scheduled_workout_exercise_targets_pk',
      columns: [table.scheduledWorkoutExerciseId, table.dimension],
    }),
    foreignKey({
      name: 'scheduled_workout_exercise_targets_fk',
      columns: [table.scheduledWorkoutExerciseId],
      foreignColumns: [scheduledWorkoutExercises.id],
    }).onDelete('cascade'),
  ]
);

export const completedSets = pgTable('completed_sets', {
  id: uuid('id').defaultRandom().primaryKey(),
  scheduledWorkoutExerciseId: uuid('scheduled_workout_exercise_id')
    .notNull()
    .references(() => scheduledWorkoutExercises.id, { onDelete: 'cascade' }),
  setNumber: integer('set_number').notNull(),
  dimension: text('dimension').notNull(),
  value: real('value').notNull(),
});

export const workoutTemplatesRelations = relations(workoutTemplates, ({ many }) => ({
  exercises: many(workoutTemplateExercises),
}));

export const workoutTemplateExercisesRelations = relations(workoutTemplateExercises, ({ one, many }) => ({
  template: one(workoutTemplates, {
    fields: [workoutTemplateExercises.templateId],
    references: [workoutTemplates.id],
  }),
  targets: many(workoutTemplateExerciseTargets),
}));

export const workoutTemplateExerciseTargetsRelations = relations(workoutTemplateExerciseTargets, ({ one }) => ({
  exercise: one(workoutTemplateExercises, {
    fields: [workoutTemplateExerciseTargets.workoutTemplateExerciseId],
    references: [workoutTemplateExercises.id],
  }),
}));

export const scheduledWorkoutsRelations = relations(scheduledWorkouts, ({ many }) => ({
  exercises: many(scheduledWorkoutExercises),
}));

export const scheduledWorkoutExercisesRelations = relations(scheduledWorkoutExercises, ({ one, many }) => ({
  scheduledWorkout: one(scheduledWorkouts, {
    fields: [scheduledWorkoutExercises.scheduledWorkoutId],
    references: [scheduledWorkouts.id],
  }),
  targets: many(scheduledWorkoutExerciseTargets),
  completedSets: many(completedSets),
}));

export const scheduledWorkoutExerciseTargetsRelations = relations(scheduledWorkoutExerciseTargets, ({ one }) => ({
  exercise: one(scheduledWorkoutExercises, {
    fields: [scheduledWorkoutExerciseTargets.scheduledWorkoutExerciseId],
    references: [scheduledWorkoutExercises.id],
  }),
}));

export const completedSetsRelations = relations(completedSets, ({ one }) => ({
  exercise: one(scheduledWorkoutExercises, {
    fields: [completedSets.scheduledWorkoutExerciseId],
    references: [scheduledWorkoutExercises.id],
  }),
}));
