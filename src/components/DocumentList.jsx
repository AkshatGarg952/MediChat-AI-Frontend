import React from 'react';
import { File, Download, X } from 'lucide-react';

const DocumentList = ({ documents, onDownload, onDeleteDocument, title = "Documents", compact = false }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!documents || documents.length === 0) {
    return null;
  }

  return (
    <div className={compact ? '' : 'bg-white rounded-xl shadow-sm border border-gray-200 p-6'}>
      <h3 className={`font-medium text-gray-900 mb-3 ${compact ? 'text-xs' : 'text-sm'}`}>
        {title}
      </h3>
      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200 ${
              compact ? 'p-2' : 'p-3'
            }`}
          >
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <File className={`text-blue-600 flex-shrink-0 ${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
              <div className="min-w-0 flex-1">
                <p className={`font-medium text-gray-900 truncate ${compact ? 'text-xs' : 'text-sm'}`}>
                  {doc.name}
                </p>
                {!compact && (
                  <p className="text-xs text-gray-500">
                    {formatFileSize(doc.size)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(doc.id);
                }}
                className={`text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors ${
                  compact ? 'p-1' : 'p-2'
                }`}
                title="Download document"
              >
                <Download className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteDocument(doc.id);
                }}
                className={`text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors ${
                  compact ? 'p-1' : 'p-2'
                }`}
                title="Delete document"
              >
                <X className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList;