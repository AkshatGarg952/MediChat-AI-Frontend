import React, { useRef, useState } from 'react';
import { Upload, File, X, AlertCircle } from 'lucide-react';

const UploadSection = ({ onFileUpload, documents, onDeleteDocument }) => {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');

  const acceptedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];

  const validateFile = (file) => {
    if (!acceptedTypes.includes(file.type)) {
      return 'Only PDF and Word documents are supported';
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return 'File size must be less than 10MB';
    }
    return null;
  };

  const handleFileSelect = (files) => {
    setError('');
    const fileArray = Array.from(files);
    const validFiles = [];
    
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        setError(error);
        return;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onFileUpload(validFiles);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files);
    e.target.value = '';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h2>
      
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">
          Drag and drop your documents here, or{' '}
          <button
         
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            browse files
          </button>
        </p>
        <p className="text-sm text-gray-500">
          Supports PDF and Word documents (max 10MB each)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      
    </div>
  );
};

export default UploadSection;