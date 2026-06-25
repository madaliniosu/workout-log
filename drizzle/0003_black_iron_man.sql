CREATE TABLE "completed_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scheduled_workout_id" uuid NOT NULL,
	"exercise_id" uuid,
	"exercise_name" text NOT NULL,
	"set_number" integer NOT NULL,
	"dimension" text NOT NULL,
	"value" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduled_workout_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scheduled_workout_id" uuid NOT NULL,
	"exercise_id" uuid,
	"exercise_name" text NOT NULL,
	"set_count" integer NOT NULL,
	"exercise_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduled_workouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"template_id" uuid,
	"name" text NOT NULL,
	"date" timestamp NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "completed_sets" ADD CONSTRAINT "completed_sets_scheduled_workout_id_scheduled_workouts_id_fk" FOREIGN KEY ("scheduled_workout_id") REFERENCES "public"."scheduled_workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "completed_sets" ADD CONSTRAINT "completed_sets_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_workout_exercises" ADD CONSTRAINT "scheduled_workout_exercises_scheduled_workout_id_scheduled_workouts_id_fk" FOREIGN KEY ("scheduled_workout_id") REFERENCES "public"."scheduled_workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_workout_exercises" ADD CONSTRAINT "scheduled_workout_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_workouts" ADD CONSTRAINT "scheduled_workouts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_workouts" ADD CONSTRAINT "scheduled_workouts_template_id_workout_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."workout_templates"("id") ON DELETE set null ON UPDATE no action;