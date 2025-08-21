/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import * as invitation from "./invitation";
import * as organization from "./organization";
import * as patient from "./patient";
import * as team from "./team";
import * as user from "./user";
import * as careException from "./care-exception";
import * as carePlan from "./care-plan";
import * as taskManagement from "./task-management";

export const schema = {
  ...invitation,
  ...organization,
  ...patient,
  ...team,
  ...user,
  ...careException,
  ...carePlan,
  ...taskManagement,
} as const;

export type DbSchema = typeof schema;
export default schema;
