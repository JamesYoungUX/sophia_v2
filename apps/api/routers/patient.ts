/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { z } from "zod";
import { eq } from "drizzle-orm";
import { publicProcedure, router } from "../lib/trpc.js";
import { patient } from "@repo/db/schema/patient";

export const patientRouter = router({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional().default({ limit: 50, offset: 0 }),
    )
    .query(async ({ input, ctx }) => {
      const { limit, offset } = input || { limit: 50, offset: 0 };
      const patients = await ctx.db
        .select({
          patId: patient.patId,
          patMrnId: patient.patMrnId,
          firstName: patient.patFirstName,
          lastName: patient.patLastName,
          middleName: patient.patMiddleName,
          birthDate: patient.birthDate,
          sex: patient.sexCName,
          city: patient.city,
          state: patient.stateCName,
          zip: patient.zip,
          phone: patient.homePhone,
          email: patient.emailAddress,
          ethnicity: patient.ethnicGroupCName,
          language: patient.languageCName,
          religion: patient.religionCName,
          status: patient.patStatusCName,
        })
        .from(patient)
        .limit(limit)
        .offset(offset)
        .orderBy(patient.patLastName, patient.patFirstName);

      return patients;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const result = await ctx.db
        .select()
        .from(patient)
        .where(eq(patient.patId, input.id))
        .limit(1);

      return result[0] || null;
    }),
});