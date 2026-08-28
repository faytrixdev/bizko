"use client";

import Link from "next/link";
import { Equal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import { cn } from "@/lib/utils";
import { LocaleSwitch } from "@/components/LocaleSwitch";

interface LandingNavbarProps {
  msg: {
    landing: { login: string; heroCta: string; navFeatures: string; navHowItWorks: string; navExamples: string; navPricing: string; navFaq: string };
  };
}

export const LandingNavbar = ({ msg }: LandingNavbarProps) => {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  const menuItems = [
    { name: msg.landing.navFeatures, href: "#fonctionnalités" },
    { name: msg.landing.navHowItWorks, href: "#comment-ça-marche" },
    { name: msg.landing.navExamples, href: "#exemples" },
    { name: msg.landing.navPricing, href: "#tarifs" },
    { name: msg.landing.navFaq, href: "#faq" },
  ];

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    if (menuState) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuState]);

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="fixed left-0 w-full z-20 px-2"
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
            isScrolled &&
              "bg-white/60 max-w-4xl rounded-2xl border border-gray-200/60 backdrop-blur-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] lg:px-5"
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-4 lg:gap-0 py-2">
            {/* Logo + Hamburger */}
            <div className="flex w-full justify-between lg:w-auto">
              <Link href="/" aria-label="Bizko" className="flex items-center">
                <img src="/logo.png" alt="Bizko" className="h-7" />
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? "Fermer le menu" : "Ouvrir le menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Equal className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 text-gray-600 duration-200" />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 text-gray-600 duration-200" />
              </button>
            </div>

            {/* Desktop nav links - centered */}
            <div className="hidden lg:flex lg:justify-center lg:flex-none">
              <ul className="flex gap-5 text-sm">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.href}
                      className="text-gray-500 hover:text-gray-900 block duration-150 whitespace-nowrap"
                    >
                      <span>{item.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mobile dropdown + Desktop auth */}
            <div
              className={cn(
                "bg-white in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-gray-100 p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-4 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none"
              )}
            >
              {/* Mobile nav links */}
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <a
                        href={item.href}
                        onClick={() => setMenuState(false)}
                        className="text-gray-500 hover:text-gray-900 block duration-150"
                      >
                        <span>{item.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Auth buttons */}
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-2 sm:space-y-0 md:w-fit md:items-center">
                <LocaleSwitch />
                <div className="hidden sm:block w-px h-5 bg-gray-200" />
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className={cn(isScrolled && "lg:hidden")}
                >
                  <Link href="/login">
                    <span>{msg.landing.login}</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className={cn(
                    "bg-[#FF6B35] hover:bg-[#EA580C] text-white",
                    isScrolled && "lg:hidden"
                  )}
                >
                  <Link href="/signup">
                    <span>{msg.landing.heroCta}</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className={cn(
                    "bg-gray-900 text-white hover:bg-gray-800",
                    isScrolled ? "lg:inline-flex" : "hidden"
                  )}
                >
                  <Link href="/signup">
                    <span>{msg.landing.heroCta}</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
