import React from "react";
import { useRouter } from "next/navigation";
import Button from "./Button";

type DetailBugModalProps = {
  isOpen: boolean;
  onClose: () => void;
  data: {
    id: string;
    rawId?: string;
    status: string;
    date: string;
    reporter: string;
    description: string;
  };
  type: 'bug' | 'non-bug';
};

const DetailBugModal = ({ isOpen, onClose, data, type }: DetailBugModalProps) => {
  const router = useRouter();
  
  if (!isOpen) return null;

  const handleViewFullDetail = () => {
    if (data.rawId) {
      router.push(`/detail-laporan?reportId=${data.rawId}`);
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    return status.toLowerCase() === 'bug' || status.toLowerCase() === 'invalid' 
      ? 'bg-red-400 text-white' 
      : 'bg-blue-400 text-white';
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center z-50 animate-in fade-in duration-300">
      <div className="fixed top-0 right-0 h-full bg-white/95 backdrop-blur-lg shadow-2xl w-full max-w-md transform animate-slide-in-right rounded-l-2xl">
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex items-center mb-4">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={onClose}
              className="mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Button>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Detail {type === 'bug' ? 'Bug' : 'Non-Bug'}</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 text-gray-500">
                <path fillRule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375zM6 12a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V12zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM6 15a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V15zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM6 18a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V18zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-black">ID</span>
              <span className="ml-auto text-sm text-black font-medium">{data.id}</span>
            </div>
            
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 text-gray-500">
                <path fillRule="evenodd" d="M3 2.25a.75.75 0 01.75.75v.54l1.838-.46a9.75 9.75 0 016.725.738l.108.054a8.25 8.25 0 005.58.652l3.109-.732a.75.75 0 01.917.81 47.784 47.784 0 00.005 10.337.75.75 0 01-.574.812l-3.114.733a9.75 9.75 0 01-6.594-.77l-.108-.054a8.25 8.25 0 00-5.69-.625l-2.202.55V21a.75.75 0 01-1.5 0V3A.75.75 0 013 2.25z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-black">Status</span>
              <span className={`ml-auto text-xs text-black px-2 py-1 rounded-md ${getStatusColor(data.status)}`}>
                {data.status}
              </span>
            </div>
            
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 text-gray-500">
                <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-black">Tanggal</span>
              <span className="ml-auto text-sm text-black">{data.date}</span>
            </div>
            
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 text-gray-500">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-black">Crowdworker</span>
              <span className="ml-auto text-sm text-black">{data.reporter}</span>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium mb-2 text-black">Deskripsi Bug</h3>
              <div className="border p-3 rounded-md min-h-[200px] text-sm text-gray-500 bg-gray-100">
                {data.description}
              </div>
            </div>

            {data.rawId && (
              <div className="mt-6 pt-4 border-t">
                <Button
                  type="button"
                  onClick={handleViewFullDetail}
                  size="md"
                  variant="primary"
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  Lihat Detail Lengkap dengan Evaluasi
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailBugModal;