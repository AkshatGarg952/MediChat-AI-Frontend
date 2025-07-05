import React from 'react';
import { X, MessageSquare, Clock, Plus } from 'lucide-react';
import DocumentList from './DocumentList';

const SessionSidebar = ({ isOpen, onClose, sessions, onLoadSession, onNewChat }) => {
  
 const formatDate = (dateString) => {
  if (!dateString) return 'Invalid Date';

  // Normalize ISO format
  const normalizedDate = dateString.replace(/\+00:00$/, 'Z'); // Replace +00:00 with Z

  const date = new Date(normalizedDate);
  if (isNaN(date)) return 'Invalid Date';

  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};





  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform">
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Chat Sessions</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={onNewChat}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto">
            {sessions.length === 0 ? (
              <div className="p-4 text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No previous sessions</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.session_id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onLoadSession(session)}
                  >
                    {/* Session Info */}
                    <div className="mb-3">
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                        Session {session.session_id}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(session.updated_at)}</span>
                        <span>•</span>
                        <span>{session.messages.length} messages</span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SessionSidebar;
