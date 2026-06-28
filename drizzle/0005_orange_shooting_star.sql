CREATE TABLE "scheduled_workout_exercise_targets" (
	"scheduled_workout_exercise_id" uuid NOT NULL,
	"dimension" text NOT NULL,
	"target_value" real NOT NULL,
	CONSTRAINT "scheduled_workout_exercise_targets_pk" PRIMARY KEY("scheduled_workout_exercise_id","dimension")
);
--> statement-breakpoint
CREATE TABLE "workout_template_exercise_targets" (
	"workout_template_exercise_id" uuid NOT NULL,
	"dimension" text NOT NULL,
	"target_value" real NOT NULL,
	CONSTRAINT "workout_template_exercise_targets_pk" PRIMARY KEY("workout_template_exercise_id","dimension")
);
--> statement-breakpoint
ALTER TABLE "scheduled_workout_exercise_targets" ADD CONSTRAINT "scheduled_workout_exercise_targets_fk" FOREIGN KEY ("scheduled_workout_exercise_id") REFERENCES "public"."scheduled_workout_exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_template_exercise_targets" ADD CONSTRAINT "workout_template_exercise_targets_fk" FOREIGN KEY ("workout_template_exercise_id") REFERENCES "public"."workout_template_exercises"("id") ON DELETE cascade ON UPDATE no action;