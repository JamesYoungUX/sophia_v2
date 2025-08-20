/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@repo/api";

export const api = createTRPCReact<AppRouter>();

export const trpcClient = api.createClient({
  links: [
    httpBatchLink({
      url: "http://localhost:8787/api/trpc",
      // You can pass any HTTP headers here
      async headers() {
        return {
          // authorization: getAuthCookie(),
        };
      },
    }),
  ],
});