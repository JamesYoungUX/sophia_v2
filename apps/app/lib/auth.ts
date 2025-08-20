/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import {
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// Explicitly type the auth client to avoid TypeScript inference issues
// in composite builds
type AuthClient = ReturnType<
  typeof createAuthClient<{
    plugins: [
      ReturnType<typeof organizationClient>,
    ];
  }>
>;

export const auth: AuthClient = createAuthClient({
  baseURL: "http://localhost:8787", // API server URL
  plugins: [organizationClient()], // Removed anonymousClient to match server config
});
