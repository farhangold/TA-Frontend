// src/app/components/PriorityButton.tsx
import React, { useState } from "react";
import Button from "./Button";

type PriorityType = "Rendah" | "Sedang" | "Tinggi" | "Kritis";

type PriorityProps = {
  initialPriority: PriorityType;
  onPriorityChange?: (priority: PriorityType) => void;
};

const PriorityButton = ({
  initialPriority,
  onPriorityChange,
}: PriorityProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [priority, setPriority] = useState(initialPriority);

  const handlePriorityChange = (newPriority: PriorityType) => {
    setPriority(newPriority);
    if (onPriorityChange) {
      onPriorityChange(newPriority);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        type="button"
        size="sm"
        variant="primary"
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center bg-gradient-to-r from-blue-500 to-purple-600 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
        rightIcon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        }
      >
        Prioritas
      </Button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-48 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-200/50 overflow-hidden">
          <ul className="py-2 text-sm">
            <li>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full flex items-center justify-start px-4 py-2.5 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white transition-all duration-200 rounded-none"
                onClick={() => handlePriorityChange("Rendah")}
              >
                <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center mr-2">
                  {priority === "Rendah" && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                Rendah
              </Button>
            </li>
            <li>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full flex items-center justify-start px-4 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white transition-all duration-200 rounded-none"
                onClick={() => handlePriorityChange("Sedang")}
              >
                <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center mr-2">
                  {priority === "Sedang" && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                Sedang
              </Button>
            </li>
            <li>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full flex items-center justify-start px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white transition-all duration-200 rounded-none"
                onClick={() => handlePriorityChange("Tinggi")}
              >
                <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center mr-2">
                  {priority === "Tinggi" && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                Tinggi
              </Button>
            </li>
            <li>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full flex items-center justify-start px-4 py-2.5 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white transition-all duration-200 rounded-none"
                onClick={() => handlePriorityChange("Kritis")}
              >
                <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center mr-2">
                  {priority === "Kritis" && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                Kritis
              </Button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PriorityButton;
