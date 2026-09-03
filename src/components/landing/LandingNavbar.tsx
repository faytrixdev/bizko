"use client";

import Link from "next/link";
import { Equal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import { cn } from "@/lib/utils";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { Logo } from "@/components/Logo";

interface LandingNavbarProps {
  msg: {
    landing: { login: string; heroCta: string; navFeatures: string; navHowItWorks: string; navExamples: string; navFaq: string };
  };
}

export const LandingNavbar = ({ msg }: LandingNavbarProps) => {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  const menuItems = [
    { name: msg.landing.navFeatures, href: "#fonctionnalites" },
    { name: msg.landing.navHowItWorks, href: "#comment-ca-marche" },
    { name: msg.landing.navExamples, href: "#exemples" },
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
            "mx-auto mt-2 max-w-6xl px-6 transition-[padding,background,box-shadow,border-color] duration-300 lg:px-12",
            isScrolled &&
              "bg-white/60 max-w-4xl rounded-2xl border border-gray-200/60 backdrop-blur-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] lg:px-5"
          )}
        >
          <div className="relative items-center py-2 hidden lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-8">
            {/* Logo */}
            <div className="flex items-center shrink-0 justify-start">
              <Link href="/" aria-label="Bizko" className="flex items-center">
                <Logo size="lg" />
              </Link>
            </div>

            {/* Desktop nav links - centered */}
            <div className="flex items-center justify-center gap-5">
              {menuItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="text-gray-500 hover:text-gray-900 duration-150 whitespace-nowrap text-[15px] font-medium"
                >
                  {item.name}
                </a>
              ))}
            </div>

            {/* Auth buttons */}
            <div className="flex items-center justify-end gap-2">
              <LocaleSwitch />
              <div className="w-px h-5 bg-gray-200" />
              <Button asChild variant="outline" size="sm" className={cn(isScrolled && "lg:hidden")}>
                <Link href="/login"><span>{msg.landing.login}</span></Link>
              </Button>
              <Button asChild size="sm" className={cn("bg-accent hover:bg-accent-hover text-white", isScrolled && "lg:hidden")}>
                <Link href="/signup"><span>{msg.landing.heroCta}</span></Link>
              </Button>
              <Button asChild size="sm" className={cn("bg-accent hover:bg-accent-hover text-white", isScrolled ? "lg:inline-flex" : "hidden")}>
                <Link href="/signup"><span>{msg.landing.heroCta}</span></Link>
              </Button>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="relative flex flex-wrap items-center justify-between gap-4 py-2 lg:hidden">
            <div className="flex w-full items-center justify-between">
              <Link href="/" aria-label="Bizko" className="flex items-center">
                <Logo size="lg" />
              </Link>
              <div className="flex items-center gap-2">
                <LocaleSwitch />
                <button
                  onClick={() => setMenuState(!menuState)}
                  aria-label={menuState ? "Fermer le menu" : "Ouvrir le menu"}
                  className="relative z-20 block cursor-pointer p-2.5"
                >
                  <Equal className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 text-gray-600 duration-200" />
                  <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 text-gray-600 duration-200" />
                </button>
              </div>
            </div>

            {/* Mobile dropdown */}
            <div
              className={cn(
                "bg-white in-data-[state=active]:block mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-gray-100 p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap"
              )}
            >
              <ul className="space-y-6 text-base">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <a href={item.href} onClick={() => setMenuState(false)} className="text-gray-500 hover:text-gray-900 block duration-150">
                      <span>{item.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-2 sm:space-y-0">
                <Button asChild variant="outline" size="sm">
                  <Link href="/login"><span>{msg.landing.login}</span></Link>
                </Button>
                <Button asChild size="sm" className="bg-accent hover:bg-accent-hover text-white">
                  <Link href="/signup"><span>{msg.landing.heroCta}</span></Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
