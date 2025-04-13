"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import ActionButton from "../components/ActionButton";
import { bugReportData } from "../data/BugReportData";
import DetailBugModal from "../components/DetailBugModal";
import UploadCsvModal from "../components/UploadCSVModal";
import ValidationModal from "../components/ValidationModal";
import DeleteConfirmationModal from "../components/DeleteModal";

const ITEMS_PER_PAGE = 10;

export default function DaftarLaporan() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState(bugReportData);

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [uploadCsvModalOpen, setUploadCsvModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(bugReportData[0]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Filter data berdasarkan search term
  useEffect(() => {
    const results = bugReportData.filter(
      (item) =>
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.date.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredData(results);
    setCurrentPage(1);
  }, [searchTerm]);

  // Hitung pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Navigasi pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle action buttons
  const handleAction = (
    type: "detailBug" | "validation" | "uploadCSV" | "delete",
    id: string
  ) => {
    const report = bugReportData.find((item) => item.id === id);
    if (!report) return;

    setSelectedReport(report);

    if (type === "detailBug") {
      setDetailModalOpen(true);
    } else if (type === "validation") {
      setValidationModalOpen(true);
    } else if (type === "uploadCSV") {
      setUploadCsvModalOpen(true);
    } else if (type === "delete") {
      setDeleteModalOpen(true);
    }
  };

  // Handle validation actions
  const handleValidate = (isValid: boolean) => {
    console.log(
      `Item ${selectedReport.id} was marked as ${isValid ? "valid" : "invalid"}`
    );
    setValidationModalOpen(false);
    // Update status logic would go here
  };

  // Handle file upload
  const handleFileUpload = (file: File) => {
    console.log(
      `File uploaded: ${file.name} for report ID: ${selectedReport.id}`
    );
    // Process file upload logic would go here
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    console.log(`Deleting bug with ID: ${selectedReport.id}`);
    // Here you would typically call an API to delete the item
    // For now we just close the modal
    setDeleteModalOpen(false);

    // You could also update the UI to remove the item from the list
    // setFilteredData(currentData => currentData.filter(item => item.id !== selectedReport.id));
  };

  // Generate nomor halaman untuk pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  // Dapatkan kelas badge status berdasarkan status laporan
  const getStatusBadgeClass = (status: string) => {
    return status === "Bug"
      ? "bg-red-300 text-red-800"
      : "bg-blue-300 text-blue-800";
  };

  return (
    <DashboardLayout title="Daftar Laporan">
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Daftar Laporan Bug</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Cari"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        {/* Tabel laporan bug */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-sm leading-normal">
                <th className="py-3 px-4 text-left w-24">ID</th>
                <th className="py-3 px-4 text-left">Deskripsi Bug</th>
                <th className="py-3 px-4 text-center w-28">Status</th>
                <th className="py-3 px-4 text-center w-36">Tanggal Dikirim</th>
                <th className="py-3 px-4 text-center w-32">Crowdworker</th>
                <th className="py-3 px-4 text-center w-32">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {paginatedData.map((report) => (
                <tr
                  key={report.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-left font-medium">
                    {report.id}
                  </td>
                  <td className="py-3 px-4 text-left">{report.description}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${getStatusBadgeClass(
                        report.status
                      )}`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">{report.date}</td>
                  <td className="py-3 px-4 text-center">{report.reporter}</td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center space-x-1">
                      <ActionButton
                        type="detailBug"
                        onClick={() => handleAction("detailBug", report.id)}
                      />
                      <ActionButton
                        type="validation"
                        onClick={() => handleAction("validation", report.id)}
                      />
                      <ActionButton
                        type="uploadCSV"
                        onClick={() => handleAction("uploadCSV", report.id)}
                      />
                      <ActionButton
                        type="delete"
                        onClick={() => handleAction("delete", report.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 text-sm">
          <div className="text-gray-600">
            Showing{" "}
            {Math.min(
              filteredData.length,
              1 + (currentPage - 1) * ITEMS_PER_PAGE
            )}{" "}
            to {Math.min(filteredData.length, currentPage * ITEMS_PER_PAGE)} of{" "}
            {filteredData.length} result
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex ml-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 md:flex justify-center items-center hidden px-3 py-1 mx-1 rounded ${
                    currentPage === page
                      ? "bg-blue-500 text-white"
                      : "border border-gray-300 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Bug Modal */}
      <DetailBugModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        data={selectedReport}
        type={selectedReport.status === "Bug" ? "bug" : "non-bug"}
      />

      {/* Validation Modal */}
      <ValidationModal
        isOpen={validationModalOpen}
        onClose={() => setValidationModalOpen(false)}
        data={selectedReport}
        type={selectedReport.status === "Bug" ? "bug" : "non-bug"}
        onValidate={handleValidate}
      />

      {/* Upload CSV Modal */}
      <UploadCsvModal
        isOpen={uploadCsvModalOpen}
        onClose={() => setUploadCsvModalOpen(false)}
        onUpload={handleFileUpload}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        bugId={selectedReport?.id.replace("BUG", "") || ""}
      />

      {/* Overlay when modal is open */}
      {(detailModalOpen ||
        validationModalOpen ||
        uploadCsvModalOpen ||
        deleteModalOpen) && (
        <style jsx global>{`
          body {
            overflow: hidden;
          }
        `}</style>
      )}
    </DashboardLayout>
  );
}
