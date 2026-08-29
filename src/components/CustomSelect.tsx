"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n/provider";

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

export function CustomSelect({ name, options, defaultValue, placeholder, required, className }: CustomSelectProps) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue || "");
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const resolvedPlaceholder = placeholder ?? t("common.choose");
  const selectedLabel = options.find((o) => o.value === selected)?.label || resolvedPlaceholder;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleOpen() {
    if (!isOpen) setActiveIndex(-1);
    setIsOpen((v) => !v);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setActiveIndex(-1);
      setIsOpen(true);
      return;
    }
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % options.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + options.length) % options.length);
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      case "Enter":
      case " ":
        if (activeIndex >= 0) {
          e.preventDefault();
          setSelected(options[activeIndex].value);
          setIsOpen(false);
        }
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  }

  useEffect(() => {
    if (isOpen && activeIndex >= 0 && listRef.current) {
      const el = listRef.current.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, isOpen]);

  return (
    <div ref={ref} className={`relative ${className || ""}`}>
      {name && <input type="hidden" name={name} value={selected} required={required} />}
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={name ? `${name}-listbox` : undefined}
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
        className={`w-full h-11 rounded-lg border border-gray-200 bg-white px-3 pr-10 text-sm text-left outline-none transition-all duration-200 ${
          selected ? "text-gray-900" : "text-gray-400"
        } focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10`}
      >
        {selectedLabel}
      </button>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
      {isOpen && (
        <div
          id={name ? `${name}-listbox` : undefined}
          role="listbox"
          ref={listRef}
          className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg max-h-60 overflow-auto animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={selected === option.value}
              data-index={index}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => {
                setSelected(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors duration-100 ${
                selected === option.value ? "bg-gray-50 text-gray-900 font-medium" : "text-gray-700"
              } ${activeIndex === index ? "bg-gray-100" : ""}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
