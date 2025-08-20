ALTER TABLE "patient" ADD COLUMN "meds_lst_rev_usr_id_name" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "self_ec_verif_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "self_ec_verif_st_yn" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "empr_id_cmt" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "pat_status_c_name" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "meds_last_rev_csn" integer;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "sex_c_name" text;