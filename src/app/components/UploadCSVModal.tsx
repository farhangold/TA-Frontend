import React, { useState, useRef } from "react";

type UploadCsvModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => void;
};

const UploadCsvModal = ({ isOpen, onClose, onUpload }: UploadCsvModalProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<"json" | "csv">("json");
  const [showExamples, setShowExamples] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setSelectedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onClose();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-end z-50">
      <div className="fixed top-0 right-0 h-full bg-gradient-to-br from-white via-gray-50 to-blue-50 shadow-2xl w-full max-w-2xl transform animate-slide-in-right">
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="white"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Upload File
                </h2>
                <p className="text-xs text-gray-500">JSON atau CSV</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-gray-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Drag & drop file kamu di sini atau klik untuk memilih file. Anda bisa
            memilih multiple files sekaligus. Sistem akan otomatis mengklasifikasikan
            laporan menjadi Bug Report atau Success Report.
          </p>

          {/* Upload Information Section - Collapsible */}
          <div className="mb-4">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="w-full flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 text-blue-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  />
                </svg>
                <span className="text-sm font-semibold text-blue-900">
                  Cara Upload Laporan
                </span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className={`w-5 h-5 text-blue-600 transition-transform ${
                  showInfo ? "rotate-180" : ""
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>

            {showInfo && (
              <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-800 space-y-3">
                  <p>
                    Sistem hanya menerima upload file dalam format{" "}
                    <strong>JSON</strong> atau <strong>CSV</strong>. Tidak ada
                    form input manual untuk membuat laporan baru.
                  </p>
                  <div>
                    <p className="font-medium mb-1">Format yang didukung:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>
                        <strong>JSON:</strong> Array of objects dengan atribut
                        yang diperlukan
                      </li>
                      <li>
                        <strong>CSV:</strong> File dengan header row dan data
                        rows
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Atribut yang diperlukan:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>
                        <strong>testId, title, version</strong> (Test Identity)
                      </li>
                      <li>
                        <strong>environment</strong> (OS, Device, Browser) -
                        bisa object, string, atau kolom terpisah
                      </li>
                      <li>
                        <strong>description</strong> (Actual Result)
                      </li>
                      <li>
                        <strong>step to reproduce</strong> (opsional, untuk Bug
                        Report)
                      </li>
                      <li>
                        <strong>evidence</strong> (opsional, untuk Bug Report)
                      </li>
                    </ul>
                  </div>
                  <p className="text-xs text-blue-700 pt-2 border-t border-blue-300">
                    <strong>Catatan:</strong> Sistem akan otomatis
                    mengklasifikasikan laporan menjadi
                    <strong> Bug Report</strong> (jika ada step to reproduce dan
                    evidence) atau
                    <strong> Success Report</strong> (jika tidak ada).
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Example Files Download Section */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-900">Contoh File:</p>
              <button
                onClick={() => setShowExamples(!showExamples)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {showExamples ? "Sembunyikan" : "Lihat Format"}
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <a
                href="/examples/example-bug-report.json"
                download
                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Download Bug Report JSON
              </a>
              <a
                href="/examples/example-success-report.json"
                download
                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Download Success Report JSON
              </a>
              <a
                href="/examples/example-bug-report.csv"
                download
                className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                Download Bug Report CSV
              </a>
              <a
                href="/examples/example-success-report.csv"
                download
                className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                Download Success Report CSV
              </a>
            </div>
          </div>

          {/* Format Examples Section */}
          {showExamples && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex gap-2 mb-3 border-b border-gray-300">
                <button
                  onClick={() => setActiveTab("json")}
                  className={`px-3 py-1 text-sm font-medium ${
                    activeTab === "json"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  JSON Format
                </button>
                <button
                  onClick={() => setActiveTab("csv")}
                  className={`px-3 py-1 text-sm font-medium ${
                    activeTab === "csv"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  CSV Format
                </button>
              </div>
              {activeTab === "json" ? (
                <div className="text-xs">
                  <p className="font-medium mb-2">Format JSON (Bug Report):</p>
                  <pre className="bg-gray-800 text-gray-100 p-2 rounded overflow-x-auto text-xs">
                    {`[
  {
    "testId": "TEST-001",
    "title": "Login Button Not Responding",
    "version": "1.0.0",
    "environment": {
      "os": "Windows 11",
      "device": "Desktop",
      "browser": "Chrome 120"
    },
    "step to reproduce": [
      "Navigate to login page",
      "Enter username and password",
      "Click login button"
    ],
    "description": "When clicking...",
    "evidence": [
      {
        "type": "SCREENSHOT",
        "url": "https://...",
        "description": "..."
      }
    ],
    "expectedResult": "...",
    "severityLevel": "HIGH",
    "domain": "Authentication"
  }
]`}
                  </pre>
                  <p className="font-medium mt-3 mb-2">
                    Format JSON (Success Report):
                  </p>
                  <pre className="bg-gray-800 text-gray-100 p-2 rounded overflow-x-auto text-xs">
                    {`[
  {
    "testId": "TEST-101",
    "title": "Successful User Registration",
    "version": "1.0.0",
    "environment": {
      "os": "Windows 11",
      "device": "Desktop",
      "browser": "Chrome 120"
    },
    "description": "User registration...",
    "severityLevel": "LOW",
    "domain": "User Registration"
  }
]`}
                  </pre>
                </div>
              ) : (
                <div className="text-xs">
                  <p className="font-medium mb-2">Format CSV:</p>
                  <pre className="bg-gray-800 text-gray-100 p-2 rounded overflow-x-auto text-xs">
                    {`testId,title,version,OS,Device,Browser,step to reproduce,description,evidence,expectedResult,severityLevel,domain
TEST-001,Login Button Not Responding,1.0.0,Windows 11,Desktop,Chrome 120,"Step1|Step2|Step3","Description...","TYPE:URL:Description","Expected...",HIGH,Authentication`}
                  </pre>
                  <p className="mt-2 text-gray-600">
                    <strong>Catatan:</strong> Untuk Success Report, kolom
                    &quot;step to reproduce&quot;, &quot;evidence&quot;, dan
                    &quot;expectedResult&quot; bisa dikosongkan.
                  </p>
                </div>
              )}
            </div>
          )}

          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 mb-6 cursor-pointer transition-all duration-300 ${
              selectedFiles.length > 0
                ? "border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg scale-[1.02]"
                : "border-purple-300 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 hover:border-purple-400 hover:shadow-lg hover:scale-[1.01]"
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
          >
            <input
              type="file"
              multiple
              className="hidden"
              accept=".csv,.json"
              onChange={handleFileChange}
              ref={fileInputRef}
            />

            {selectedFiles.length === 0 ? (
              <>
                <div className="flex flex-col items-center justify-center min-h-[180px]">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center mb-4 shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="white"
                      className="w-10 h-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
                  </div>
                  <p className="text-base font-semibold text-gray-700 mb-2">
                    Drop file di sini atau klik untuk memilih
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="px-2 py-1 bg-white/60 rounded-md text-xs font-medium">
                      JSON
                    </span>
                    <span className="px-2 py-1 bg-white/60 rounded-md text-xs font-medium">
                      CSV
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>Multiple files</span>
                    <span className="text-gray-400">•</span>
                    <span>Max 20MB per file</span>
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[180px]">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-4 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="white"
                    className="w-10 h-10"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="w-full max-w-sm space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-800">
                      {selectedFiles.length} file dipilih
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearAll();
                      }}
                      className="text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      Hapus Semua
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl shadow-md flex items-center gap-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="white"
                            className="w-6 h-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile(index);
                          }}
                          className="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors flex-shrink-0"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4 text-red-600"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Klik untuk menambah file lain
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-between gap-4 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Batal
            </button>
            <button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                selectedFiles.length > 0
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {selectedFiles.length > 0 ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  Upload {selectedFiles.length} File
                </span>
              ) : (
                "Pilih File Dulu"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadCsvModal;
