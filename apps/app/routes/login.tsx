/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { LoginForm } from "@repo/ui";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { auth } from "@/lib/auth";
import { useState } from "react";

export const Route = createFileRoute("/login")({  
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const result = await auth.signIn.email({
        email,
        password,
      });
      
      if (result.error) {
        throw new Error(result.error.message || "Login failed");
      }
      
      // Redirect to dashboard or home page after successful login
      navigate({ to: "/" });
    } catch (error) {
      throw error; // Re-throw to let LoginForm handle the error display
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            Sophia Health
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm onLogin={handleLogin} isLoading={isLoading} />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/unsplash/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1200&q=80"
          alt="Healthcare professionals collaborating"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}