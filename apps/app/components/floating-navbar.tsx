"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ThemeSwitch } from "@/components/theme-switch";
import { LoginButton } from "@/components/auth/login-button";
import { Button } from "@workspace/ui/components/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer";
import { ROUTES } from "@/lib/routes";

export const FloatingNavbar = () => {
  const isMobile = useIsMobile();

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-3 left-1/2 transform -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-4xl"
    >
      <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 rounded-full px-4 py-1 md:px-8 shadow-2xl shadow-black/10 dark:shadow-black/50">
        <div className="flex items-center justify-between w-full">
          {/* Logo/Brand */}
          <Link href={ROUTES.HOME} className="flex items-center">
            <div className="text-base md:text-lg font-bold text-black dark:text-white tracking-wider">
              HUBSHIFT
            </div>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <>
              {/* Navigation Items */}
              <div className="flex items-center space-x-8">
                <Link
                  href={ROUTES.DASHBOARD.ROOT}
                  className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white transition-colors duration-200"
                >
                  Dashboard
                </Link>
              </div>

              {/* Desktop Actions */}
              <div className="flex items-center gap-2">
                <LoginButton>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Login
                  </Button>
                </LoginButton>
                <ThemeSwitch />
              </div>
            </>
          )}

          {/* Mobile Actions */}
          {isMobile && (
            <div className="flex items-center gap-2">
              <ThemeSwitch />
              <Drawer direction="right">
                <DrawerTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    aria-label="Open menu"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="h-full w-[300px] mt-0 rounded-none">
                  <DrawerHeader className="text-left border-b border-gray-200 dark:border-gray-700">
                    <DrawerTitle className="text-lg font-bold text-black dark:text-white tracking-wider">
                      HUBSHIFT
                    </DrawerTitle>
                  </DrawerHeader>

                  <div className="flex flex-col space-y-1 px-6 py-6">
                    {/* Mobile Navigation Items */}
                    <DrawerClose asChild>
                      <Link
                        href={ROUTES.DASHBOARD.ROOT}
                        className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white transition-colors duration-200 py-3 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        Dashboard
                      </Link>
                    </DrawerClose>

                    <DrawerClose asChild>
                      <Link
                        href={ROUTES.CALCULATOR}
                        className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white transition-colors duration-200 py-3 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        Calculator
                      </Link>
                    </DrawerClose>

                    {/* Mobile Login Button */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                      <DrawerClose asChild>
                        <LoginButton>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start py-3 px-3 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            Login
                          </Button>
                        </LoginButton>
                      </DrawerClose>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};
