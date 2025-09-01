import React, { useState } from 'react';
import { X, Eye, Download } from 'lucide-react';

interface ImagePreviewProps {
  url: string;
  title: string;
  className?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ url, title, className = "" }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Use the URL as-is since Vite proxy will handle /uploads routing to backend
  const fullImageUrl = url;

  const handleImageError = () => {
    setImageError(true);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fullImageUrl;
    link.download = title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (imageError) {
    return (
      <div className={`text-sm text-red-600 ${className}`}>
        Image not available
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center text-blue-600 hover:text-blue-800 transition-colors ${className}`}
      >
        <Eye className="w-4 h-4 mr-1" />
        View {title}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{title}</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownload}
                  className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 max-h-[80vh] overflow-auto">
              <img
                src={fullImageUrl}
                alt={title}
                className="max-w-full h-auto"
                onError={handleImageError}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImagePreview;
