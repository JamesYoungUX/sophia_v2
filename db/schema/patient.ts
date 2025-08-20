/**
 * Patient table schema
 * 
 * This table stores comprehensive patient information including demographics,
 * contact information, medical details, and administrative data.
 * Based on Epic Clarity PATIENT table structure.
 */

import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { organization } from "./organization";
import { user } from "./user";

export const patient = pgTable("patient", {
  // Primary Key
  patId: text("pat_id").primaryKey(),
  
  // Basic Demographics
  patName: text("pat_name").notNull(),
  birthDate: timestamp("birth_date", { withTimezone: true, mode: "date" }),
  deathDate: timestamp("death_date", { withTimezone: true, mode: "date" }),
  ssn: text("ssn"),
  patMrnId: text("pat_mrn_id"),
  
  // Address Information
  city: text("city"),
  stateCName: text("state_c_name"),
  countyCName: text("county_c_name"),
  countryCName: text("country_c_name"),
  zip: text("zip"),
  
  // Temporary Address Information
  tmpCity: text("tmp_city"),
  tmpStateCName: text("tmp_state_c_name"),
  tmpCountyCName: text("tmp_county_c_name"),
  tmpCountryCName: text("tmp_country_c_name"),
  tmpZip: text("tmp_zip"),
  tmpHomePhone: text("tmp_home_phone"),
  tmpAddrStartDt: timestamp("tmp_addr_start_dt", { withTimezone: true, mode: "date" }),
  
  // Contact Information
  homePhone: text("home_phone"),
  workPhone: text("work_phone"),
  emailAddress: text("email_address"),
  
  // Demographics and Cultural Information
  ethnicGroupCName: text("ethnic_group_c_name"),
  religionCName: text("religion_c_name"),
  languageCName: text("language_c_name"),
  
  // Registration and Status Information
  regDate: timestamp("reg_date", { withTimezone: true, mode: "date" }),
  regStatusCName: text("reg_status_c_name"),
  legalStatusCName: text("legal_status_c_name"),
  birthStatusCName: text("birth_status_c_name"),
  
  // Insurance Information
  medicareNum: text("medicare_num"),
  medicaidNum: text("medicaid_num"),
  
  // Medical Directives and Preferences
  advDirectiveYn: text("adv_directive_yn"),
  advDirectiveDate: timestamp("adv_directive_date", { withTimezone: true, mode: "date" }),
  organDonorYn: text("organ_donor_yn"),
  
  // Provider and Location Information
  curPcpProvIdProvName: text("cur_pcp_prov_id_prov_name"),
  curPrimLocIdLocName: text("cur_prim_loc_id_loc_name"),
  
  // Pediatric Information
  pedMultBirthOrd: integer("ped_mult_birth_ord"),
  pedMultBirthTot: integer("ped_mult_birth_tot"),
  
  // System Information
  createUserId: text("create_user_id"),
  createUserIdName: text("create_user_id_name"),
  recCreatePatId: text("rec_create_pat_id"),
  recCreatePatIdName: text("rec_create_pat_id_name"),
  
  // Additional Temporary Address Information
  tmpAddrEndDt: timestamp("tmp_addr_end_dt", { withTimezone: true, mode: "date" }),
  tmpCareOfPerson: text("tmp_care_of_person"),
  
  // Patient Name Components
  patLastName: text("pat_last_name"),
  patFirstName: text("pat_first_name"),
  patMiddleName: text("pat_middle_name"),
  patTitleCName: text("pat_title_c_name"),
  patNameSuffixCName: text("pat_name_suffix_c_name"),
  
  // Special Status and Language Preferences
  specialStatusCName: text("special_status_c_name"),
  langCareCName: text("lang_care_c_name"),
  langWritCName: text("lang_writ_c_name"),
  
  // Proxy Information
  proxyPatYn: text("proxy_pat_yn"),
  proxyPackYn: text("proxy_pack_yn"),
  
  // Employment Information
  employerId: text("employer_id"),
  employerIdEmployerName: text("employer_id_employer_name"),
  empyStatusCName: text("empy_status_c_name"),
  
  // Guardian Information
  guardianName: text("guardian_name"),
  
  // Preferred Provider Information
  prefClinZip: text("pref_clin_zip"),
  prefPcpSexCName: text("pref_pcp_sex_c_name"),
  prefPcpSpecCName: text("pref_pcp_spec_c_name"),
  prefPcpLangCName: text("pref_pcp_lang_c_name"),
  
  // Country of Origin
  countryOfOrigCName: text("country_of_orig_c_name"),
  
  // Pediatric Birth Information
  pedCesareanYn: text("ped_cesarean_yn"),
  pedNourMethCName: text("ped_nour_meth_c_name"),
  pedDelivrMethCName: text("ped_delivr_meth_c_name"),
  pedMultiBirthYn: text("ped_multi_birth_yn"),
  
  // Expected Delivery Date Information
  eddDt: timestamp("edd_dt", { withTimezone: true, mode: "date" }),
  eddEnteredDt: timestamp("edd_entered_dt", { withTimezone: true, mode: "date" }),
  eddCmt: text("edd_cmt"),
  
  // Additional Patient Flags
  intrptrNeededYn: text("intrptr_needed_yn"),
  pcpDonChartYn: text("pcp_don_chart_yn"),
  patHasIolYn: text("pat_has_iol_yn"),
  
  // Additional Pediatric Birth History
  pedBirthLabor: text("ped_birth_labor"),
  pedHospDays: text("ped_hosp_days"),
  pedHospName: text("ped_hosp_name"),
  pedHospLocation: text("ped_hosp_location"),
  
  // Medication Review Information
  medsLastRevTm: timestamp("meds_last_rev_tm", { withTimezone: true, mode: "date" }),
  medsLstRevUsrId: text("meds_lst_rev_usr_id"),
  medsLstRevUsrIdName: text("meds_lst_rev_usr_id_name"),
  
  // Emergency contact verification
  selfEcVerifDate: timestamp("self_ec_verif_date", { withTimezone: true, mode: "date" }),
  selfEcVerifStYn: text("self_ec_verif_st_yn"),
  
  // Employer comment
  emprIdCmt: text("empr_id_cmt"),
  
  // Patient status
  patStatusCName: text("pat_status_c_name"),
  
  // Medication review CSN
  medsLastRevCsn: integer("meds_last_rev_csn"),
  
  // Sex category name
  sexCName: text("sex_c_name"),

  // Audit fields
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const patientRelations = relations(patient, ({ one }) => ({
  // Add relations as needed when other tables are created
}));

export type Patient = typeof patient.$inferSelect;
export type NewPatient = typeof patient.$inferInsert;