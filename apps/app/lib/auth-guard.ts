import { redirect } from "@tanstack/react-router";
import { auth } from "@/lib/auth";

/**
 * Authentication guard function to protect routes
 * Redirects to login page if user is not authenticated or is anonymous
 */
export const requireAuth = async () => {
  const session = await auth.getSession();
  
  if (!session?.data?.user) {
    throw redirect({
      to: "/login",
    });
  }
  
  return session;
};