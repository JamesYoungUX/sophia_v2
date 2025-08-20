ALTER TABLE "patient" ADD COLUMN "tmp_addr_end_dt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "tmp_care_of_person" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "pat_last_name" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "pat_first_name" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "pat_middle_name" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "pat_title_c_name" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "pat_name_suffix_c_name" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "special_status_c_name" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "lang_care_c_name" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "lang_writ_c_name" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "proxy_pat_yn" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "proxy_pack_yn" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "employer_id" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "employer_id_employer_name" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "empy_status_c_name" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "guardian_name" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "pref_clin_zip" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "pref_pcp_sex_c_name" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "pref_pcp_spec_c_name" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "pref_pcp_lang_c_name" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "country_of_orig_c_name" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "ped_cesarean_yn" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "ped_nour_meth_c_name" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "ped_delivr_meth_c_name" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "ped_multi_birth_yn" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "edd_dt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "edd_entered_dt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "edd_cmt" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "intrptr_needed_yn" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "pcp_don_chart_yn" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "pat_has_iol_yn" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "ped_birth_labor" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "ped_hosp_days" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "ped_hosp_name" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "ped_hosp_location" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "meds_last_rev_tm" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "meds_lst_rev_usr_id" text;