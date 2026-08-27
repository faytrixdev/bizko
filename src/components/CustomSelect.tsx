"use client";

import { useState, useRef, useEffect } from "react";

interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  name?: string;
  options: CustomSelectOption[];
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function CustomSelect({ name, options, defaultValue, placeholder = "Choisir...", required, className }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue || "");
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === selected)?.label || "";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative ${className || ""}`}>
      {name && <input type="hidden" name={name} value={selected} required={required} />}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-11 rounded-lg border border-gray-200 bg-white px-3 pr-10 text-sm text-left outline-none transition-all duration-200 ${
          selected ? "text-gray-900" : "text-gray-400"
        } focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10`}
      >
        {selectedLabel || placeholder}
      </button>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg max-h-60 overflow-auto animate-in fade-in slide-in-from-top-2 duration-150">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setSelected(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors duration-100 ${
                selected === option.value ? "bg-gray-50 text-gray-900 font-medium" : "text-gray-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
