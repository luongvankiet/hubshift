import { Logo } from "@/assets/logo";
import { ThemeSwitch } from "@/components/theme-switch";
import Link from "next/link";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-3 lg:px-0">
      <div className="lg:p-8 lg:col-span-1 mx-auto w-full">
        <div className="mx-auto flex w-full flex-col items-center justify-center space-y-2 py-8 sm:p-8">
          <div className="mb-4 flex items-center justify-center">
            <Logo className="me-2" />
            <h1 className="text-2xl font-bold">Hubshift</h1>
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-col items-center justify-center space-y-4">
          {children}
          <p className="text-muted-foreground px-8 text-center text-sm">
            By clicking sign in, you agree to our{" "}
            <a
              href="/terms"
              className="hover:text-primary underline underline-offset-4"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="hover:text-primary underline underline-offset-4"
            >
              Privacy Policy
            </a>
            .
          </p>

          <ThemeSwitch />
        </div>
      </div>

      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex lg:col-span-2">
        <div className="absolute inset-0 bg-cover bg-center bg-[url('/images/backgrounds/back.png')] dark:bg-[url('/images/backgrounds/dark.png')]" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Link href="/">
            <div className="mb-4 flex items-center justify-center">
              <Logo className="me-2 text-gray-600 dark:text-white" />
              <h1 className="text-2xl font-bold text-gray-600 dark:text-white">Hubshift</h1>
            </div>
          </Link>
        </div>

        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-2xl text-black dark:text-white">
              &ldquo;Connecting Care for The Community.&rdquo;
            </p>
            <footer className="text-sm text-black dark:text-white">
              Hubshift
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
