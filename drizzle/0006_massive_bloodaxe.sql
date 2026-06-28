ALTER TABLE "workout_sessions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "workout_sets" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "workout_sessions" CASCADE;--> statement-breakpoint
DROP TABLE "workout_sets" CASCADE;--> statement-breakpoint
ALTER TABLE "completed_sets" DROP CONSTRAINT "completed_sets_scheduled_workout_id_scheduled_workouts_id_fk";
--> statement-breakpoint
ALTER TABLE "completed_sets" DROP CONSTRAINT "completed_sets_exercise_id_exercises_id_fk";
--> statement-breakpoint
ALTER TABLE "workout_template_exercises" DROP CONSTRAINT "workout_template_exercises_exercise_id_exercises_id_fk";
--> statement-breakpoint
ALTER TABLE "workout_template_exercises" ALTER COLUMN "exercise_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "completed_sets" ADD COLUMN "scheduled_workout_exercise_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "workout_template_exercises" ADD COLUMN "exercise_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "completed_sets" ADD CONSTRAINT "completed_sets_scheduled_workout_exercise_id_scheduled_workout_exercises_id_fk" FOREIGN KEY ("scheduled_workout_exercise_id") REFERENCES "public"."scheduled_workout_exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_template_exercises" ADD CONSTRAINT "workout_template_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "completed_sets" DROP COLUMN "scheduled_workout_id";--> statement-breakpoint
ALTER TABLE "completed_sets" DROP COLUMN "exercise_id";--> statement-breakpoint
ALTER TABLE "completed_sets" DROP COLUMN "exercise_name";