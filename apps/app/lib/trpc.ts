/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import type { AppRouter } from "@repo/api";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";

export const api = createTRPCReact<AppRouter>();

export const trpcClient = api.createClient({
  links: [
    httpBatchLink({
      url: "http://localhost:8787/api/trpc",
      // Include cookies for session-based auth
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
});

// Export trpc as an alias for api (this is what the components expect)
export const trpc = api;
