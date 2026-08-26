"use client";

import { useState } from "react";
import { Input } from "./Input";

export function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={show ? "text" : "password"} className="pr-10" />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Masquer" : "Afficher"}
        className="absolute right-1 top-1 h-9 w-9 inline-flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition"
      >
        <span className="text-[11px] font-medium tracking-widest uppercase">{show ? "Masquer" : "Voir"}</span>
      </button>
    </div>
  );
}
