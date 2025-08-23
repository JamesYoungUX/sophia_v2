/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import schema from "./schema";

export type { DbSchema } from "./schema";
export { schema };

// Export Db as an alias for schema (this is what the API expects)
export const Db = schema;
