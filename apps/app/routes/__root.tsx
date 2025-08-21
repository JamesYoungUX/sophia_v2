/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { createRootRoute, Outlet, useLocation, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Layout } from "@/components/layout";
import { StoreProvider } from "@/lib/store";
import { auth } from "@/lib/auth";

export const Route = createRootRoute({
  component: Root,
});

export function Root() {
  const location = useLocation();
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/forgot-password";

  if (isAuthRoute) {
    return (
      <StoreProvider>
        <Outlet />
        <TanStackRouterDevtools />
      </StoreProvider>
    );
  }

  return (
    <Layout>
      <Outlet />
      <TanStackRouterDevtools />
    </Layout>
  );
}
