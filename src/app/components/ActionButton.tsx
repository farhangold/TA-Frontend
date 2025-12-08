// src/app/components/ActionButton.tsx
import React from "react";

type ActionButtonProps = {
  type: "delete" | "detailBug" | "validation" | "uploadCSV";
  onClick: () => void;
};

const ActionButton = ({ type, onClick }: ActionButtonProps) => {
  const getButton = () => {
    switch (type) {
      case "delete":
        return (
          <button
            onClick={onClick}
            className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg shadow-md hover:shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
          >
            {/* Icon delete */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        );
      case "detailBug":
        return (
          <button
            onClick={onClick}
            className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
          >
            {/* Icon detail bug (info) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z" />
              <path d="M11 10h2v6h-2zM11 7h2v2h-2z" />
            </svg>
          </button>
        );
      case "validation":
        return (
          <button
            onClick={onClick}
            className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-md hover:shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
          >
            {/* Icon validasi (centang) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
        );
      case "uploadCSV":
        return (
          <button
            onClick={onClick}
            className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg shadow-md hover:shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
          >
            {/* Icon upload CSV */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 12l-4-4-4 4m4-4v9"
              />
            </svg>
          </button>
        );
      default:
        return null;
    }
  };

  return getButton();
};

export default ActionButton;
