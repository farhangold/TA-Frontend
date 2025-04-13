import React from 'react';

type DeleteConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bugId: string;
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, bugId }: DeleteConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-blue-50 rounded-lg p-8 w-full max-w-md flex flex-col items-center text-center">
        {/* Trash icon */}
        <div className="mb-6">
          <div className="w-32 h-32 mx-auto relative">
            {/* Trash lid */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-teal-200 rounded-t-md"></div>
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-gray-500 rounded-t-md"></div>
            
            {/* Trash body */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-24 h-28 bg-gray-500 rounded-md overflow-hidden">
              {/* Trash lines */}
              <div className="absolute left-4 top-2 h-24 w-2 bg-teal-200 rounded-full"></div>
              <div className="absolute left-11 top-2 h-24 w-2 bg-teal-200 rounded-full"></div>
              <div className="absolute left-18 top-2 h-24 w-2 bg-teal-200 rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* Text content */}
        <h2 className="text-3xl font-bold mb-4 text-black">
          Anda yakin ingin menghapus Bug ini?
        </h2>
        <p className="text-gray-600 mb-8">
          &quot;ID: #{bugId}&quot;
        </p>
        
        {/* Action buttons */}
        <div className="flex space-x-4 w-full">
          <button 
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-md font-medium"
          >
            Iya
          </button>
          <button 
            onClick={onClose}
            className="flex-1 bg-white hover:bg-gray-100 text-black py-3 px-6 rounded-md border border-gray-300 font-medium"
          >
            Tidak
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;