CREATE TABLE "hidden_exercises" (
	"user_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	CONSTRAINT "hidden_exercises_user_id_exercise_id_pk" PRIMARY KEY("user_id","exercise_id")
);
--> statement-breakpoint
ALTER TABLE "workout_sets" DROP CONSTRAINT "workout_sets_exercise_id_exercises_id_fk";
--> statement-breakpoint
ALTER TABLE "hidden_exercises" ADD CONSTRAINT "hidden_exercises_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hidden_exercises" ADD CONSTRAINT "hidden_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;