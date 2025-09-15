"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

interface LoginButtonProps {
  children: React.ReactNode;
  mode?: "modal" | "redirect";
  asChild?: boolean;
}

export const LoginButton = ({ children }: LoginButtonProps) => {
  const router = useRouter();

  return (
    <div
      onClick={() => {
        router.push(ROUTES.AUTH.SIGN_IN);
      }}
    >
      {children}
    </div>
  );
};
