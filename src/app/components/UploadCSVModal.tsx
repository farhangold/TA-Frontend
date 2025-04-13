import React, { useState, useRef } from "react";

type UploadCsvModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
};

const UploadCsvModal = ({ isOpen, onClose, onUpload }: UploadCsvModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      onClose();
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center z-50">
      <div className="fixed top-0 right-0 h-full bg-white shadow-xl w-full max-w-md transform animate-slide-in-right">
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex items-center mb-4">
            <button onClick={onClose} className="mr-2 text-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
            </button>
            <h2 className="text-lg font-medium text-gray-800">
              Upload file CSV
            </h2>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Unggah file untuk import format CSV untuk mempermudah pengolahan
            data. Pastikan file yang anda unggah dalam format CSV dan tidak
            lebih dari 20mb.
          </p>

          <div
            className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50 flex flex-col items-center justify-center min-h-[200px] mb-6 cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
          >
            <input
              type="file"
              className="hidden"
              accept=".csv"
              onChange={handleFileChange}
              ref={fileInputRef}
            />

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-10 h-10 text-blue-500 mb-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>

            <p className="text-sm text-blue-500 mb-1">
              Klik untuk upload atau tarik dan taruh
            </p>
            <p className="text-xs text-gray-500">CSV. Ukuran file max 20mb</p>

            {selectedFile && (
              <div className="mt-4 flex items-center text-blue-600 bg-blue-100 px-3 py-2 rounded-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
                <span className="text-sm truncate max-w-[200px]">
                  {selectedFile.name}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-between gap-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile}
              className={`flex-1 py-2 px-4 rounded transition-colors ${
                selectedFile
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-blue-300 text-white cursor-not-allowed"
              }`}
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadCsvModal;
