import React, { useState, useEffect } from 'react';
import { MessageSquare, FileText, Plus } from 'lucide-react';
import axios from 'axios';
import UploadSection from './components/UploadSection';
import ChatBox from './components/ChatBox';
import SessionSidebar from './components/SessionSidebar';
import DocumentList from './components/DocumentList';
import { useNavigate } from 'react-router-dom';


function App() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = 'https://medichat-ai.onrender.com';
  
  if(currentSessionId){
  console.log(currentSessionId);
  }

  useEffect(() => {

  const initNewChat = async () => {
    const storedSessionId = localStorage.getItem('currentSessionId');
    if (storedSessionId) {
      console.log("Loading stored session:", storedSessionId);
      setCurrentSessionId(storedSessionId);
    } else {
      await handleNewChat();
    }
  };

  initNewChat();
}, []);


  
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error('No authentication token found');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/session/get-user-sessions`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSessions(response.data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };

    fetchSessions();
  }, []);


  useEffect(() => {
    if (currentSessionId) {
      fetchDocuments(currentSessionId);
      fetchMessages(currentSessionId);

    } else {
      setDocuments([]);
    }
  }, [currentSessionId]);

  
  const fetchDocuments = async (sessionId) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    const response = await axios.get(`${API_BASE_URL}/doc/list-documents/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const docsArray = response.data.documents; // ✅ Correctly accessing the array

    if (!Array.isArray(docsArray)) {
      console.error("Expected 'documents' to be an array but got:", response.data);
      setDocuments([]);
      return;
    }

    const formattedDocuments = docsArray.map(doc => ({
      id: doc.doc_id,
      name: doc.metadata.file_name,
      size: doc.metadata.file_size,
      type: doc.metadata.file_type,
      uploadedAt: doc.uploaded_at,
      cloudinaryUrl: doc.cloudinary_url,
    }));

    setDocuments(formattedDocuments);
  } catch (error) {
    console.error('Error fetching documents:', error);
    if (error.response?.status === 404) {
      setDocuments([]);
    }
  }
};


  const handleFileUpload = async (files) => {
    if (!currentSessionId) {
      alert('Please select or create a session first');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(
          `${API_BASE_URL}/doc/upload-document/${currentSessionId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (response.data.error) {
          alert(`Upload failed: ${response.data.error}`);
          continue;
        }

        // Since upload response lacks full metadata, refetch documents to ensure consistency
        console.log("Calling the uplaod!");
        await fetchDocuments(currentSessionId);
      } catch (error) {
        console.error('Error uploading document:', error);
        alert('Failed to upload document');
      }
    }
  };

  
  const handleDeleteDocument = async (docId) => {
    if (!currentSessionId) {
      console.error('No session selected');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/doc/delete-document/${docId}/${currentSessionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );      
      // setDocuments(prev => prev.filter(doc => doc.doc_id !== docId));
      console.log(response.data.message);
      console.log("Calling the uplaod!");
        await fetchDocuments(currentSessionId);
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };


const fetchMessages = async (sessionId) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    const response = await axios.get(`${API_BASE_URL}/chat/history/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const messagesArray = response.data.messages;

    if (!Array.isArray(messagesArray)) {
      console.error("Expected 'messages' to be an array but got:", response.data);
      setMessages([]);
      return;
    }

    const convertedMessages = [];

    (messagesArray || []).forEach((msg, index) => {
      convertedMessages.push({
        id: `user-${index}`,
        type: 'user',
        content: msg.question || msg.refined_question || 'User asked something',
        timestamp: msg.timestamp,
      });

      convertedMessages.push({
        id: `bot-${index}`,
        type: 'bot',
        content: msg.answer || 'No answer available',
        timestamp: msg.timestamp,
      });
    });

    setMessages(convertedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    if (error.response?.status === 404) {
      setMessages([]);
    }
  }
};


   const handleSendMessage = async (content, contentType, sender, source, skipBackend = false) => {
    console.log('handleSendMessage called with:', { content, contentType, sender, source });

    // Skip bot messages (e.g., transcription or error messages) as they don't need API calls
    if (sender === 'bot') {
      const botMessage = {
        id: Date.now(),
        type: sender,
        content,
        source: source || 'text',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
      return;
    }

    if (sender === 'user' && skipBackend) {
    const userMessage = {
      id: Date.now(),
      type: sender,
      content,
      source: source || 'text',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    return;
  }

    if (!content.trim() || documents.length === 0) {
      console.log('Message not sent: empty content or no documents');
      return;
    }

    // Add user message to state only once
    const userMessage = {
      id: Date.now(),
      type: sender,
      content,
      source: source || 'text',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('question', content);

      const response = await fetch(`${API_BASE_URL}/chat/ask/${currentSessionId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Streaming response failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      let botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: '',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        botMessage.content += chunk;

        setMessages((prev) =>
          prev.map((m) => (m.id === botMessage.id ? { ...m, content: botMessage.content } : m))
        );
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error streaming response:', error);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, something went wrong while getting the response.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }
  };


//   const handleSendMessage = async (message) => {
//   if (!message.trim() || documents.length === 0) return;

//   const userMessage = {
//     id: Date.now(),
//     type: 'user',
//     content: message,
//     timestamp: new Date().toISOString(),
//   };

//   setMessages(prev => [...prev, userMessage]);
//   setIsLoading(true);

//   try {
//     const token = localStorage.getItem('authToken');
//     if (!token) {
//       console.error('No authentication token found');
//       return;
//     }

//     const formData = new FormData();
//     formData.append("question", message);

//     const response = await fetch(`${API_BASE_URL}/chat/ask/${currentSessionId}`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//       body: formData,
//     });

//     if (!response.ok) {
//       throw new Error("Streaming response failed");
//     }

//     const reader = response.body.getReader();
//     const decoder = new TextDecoder("utf-8");
 
//     let botMessage = {
//       id: Date.now() + 1,
//       type: 'bot',
//       content: '',
//       timestamp: new Date().toISOString(),
//     };

//     setMessages(prev => [...prev, botMessage]);

//     while (true) {
//       const { done, value } = await reader.read();
//       if (done) break;

//       const chunk = decoder.decode(value, { stream: true });
//       botMessage.content += chunk;

//       setMessages(prev =>
//         prev.map(m => (m.id === botMessage.id ? { ...m, content: botMessage.content } : m))
//       );
//     }

//     setIsLoading(false);
//     // saveCurrentSession([...messages, userMessage, botMessage]);

//   } catch (error) {
//     console.error('Error streaming response:', error);
//     const botMessage = {
//       id: Date.now() + 1,
//       type: 'bot',
//       content: 'Sorry, something went wrong while getting the response.',
//       timestamp: new Date().toISOString(),
//     };
//     setMessages(prev => [...prev, botMessage]);
//     setIsLoading(false);
//   }
// };

 const handleLoaad = async () => {
    setMessages([]);
    setDocuments([]);
    setCurrentSessionId(null);
    setSidebarOpen(false);

    try {
      const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    const nextIdRes = await axios.get(`${API_BASE_URL}/session/get-next-session-id`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const nextSessionId = nextIdRes.data.next_session_id;

    if(currentSessionId===null){
    setCurrentSessionId(nextSessionId);
    }

    else{
      setCurrentSessionId(currentSessionId);
    }


    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };


  const handleNewChat = async () => {
    setMessages([]);
    setDocuments([]);
    setCurrentSessionId(null);
    setSidebarOpen(false);
    
    try {
      const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    const nextIdRes = await axios.get(`${API_BASE_URL}/session/get-next-session-id`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const nextSessionId = nextIdRes.data.next_session_id;

    setCurrentSessionId(nextSessionId);
    localStorage.setItem('currentSessionId', nextSessionId);
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };

  
  const handleLoadSession = (session) => {
    const convertedMessages = [];
    
  (session.messages || []).forEach((msg, index) => {
    convertedMessages.push({
      id: `user-${index}`,
      type: 'user',
      content: msg.question || msg.refined_question || 'User asked something',
      timestamp: msg.timestamp,
    });

    convertedMessages.push({
      id: `bot-${index}`,
      type: 'bot',
      content: msg.answer || 'No answer available',
      timestamp: msg.timestamp,
    });
  });

  setMessages(convertedMessages);
    setDocuments(
      (session.documents || []).map(doc => ({
        id: doc.doc_id,
        name: doc.metadata.file_name,
        size: doc.metadata.file_size,
        type: doc.metadata.file_type,
        uploadedAt: doc.uploaded_at,
        cloudinaryUrl: doc.cloudinary_url,
      }))
    );
    
    setCurrentSessionId(session.session_id);
    localStorage.setItem('currentSessionId', session.session_id);
    setSidebarOpen(false);
  };

 
  const handleDownloadDocument = (docId) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      // Use Cloudinary URL directly for download
      window.open(doc.cloudinaryUrl, '_blank');
      console.log('Downloading document:', doc.name);
    }
  };

  const handleLogout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentSessionId');
  navigate('/');
};


const handleAudioUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const token = localStorage.getItem('authToken');

  const formData = new FormData();
  formData.append("audio_file", file);

  try {
    const response = await fetch(`http://localhost:8000/chat/summarize-audio/${currentSessionId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Upload failed");
    }

    // 🔥 Get PDF stream as Blob
    const blob = await response.blob();

    // 🧷 Create temporary download link
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Summary_${currentSessionId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

   
    URL.revokeObjectURL(link.href);

  } catch (err) {
    console.error("Audio summarization failed:", err.message);
    alert("Error: " + err.message);
  }
};



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      {/* Left: New Chat + Sidebar */}
      <div className="flex items-center space-x-3">
        <button
          onClick={handleNewChat}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </button>

        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MessageSquare className="h-5 w-5" />
        </button>
      </div>

      {/* Right: Logout */}
     {/* Right: Convert Audio to Summary + Logout */}
<div className="flex items-center space-x-3">
  {/* Hidden File Input */}
 <button
  onClick={() => document.getElementById("audio-upload").click()}
  className="inline-flex items-center px-3 py-2 border border-green-500 text-sm font-medium rounded-md text-green-700 hover:bg-green-100 transition-colors"
>
  Convert Audio to Summary
</button>

<input
  type="file"
  accept="audio/*"
  id="audio-upload"
  className="hidden"
  onChange={handleAudioUpload}
/>


  {/* Logout Button */}
  <button
    onClick={handleLogout}
    className="inline-flex items-center px-3 py-2 border border-red-500 text-sm font-medium rounded-md text-red-600 hover:bg-red-100 transition-colors"
  >
    Logout
  </button>
</div>

    </div>
  </div>
</header>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <UploadSection
              onFileUpload={handleFileUpload}
              documents={documents}
              onDeleteDocument={handleDeleteDocument}
            />
            {documents.length > 0 && (
              <DocumentList
                documents={documents}
                onDownload={handleDownloadDocument}
                onDeleteDocument={handleDeleteDocument}
                title="Current Session Documents"
              />
            )}
          </div>
          <div className="lg:col-span-2">
            <ChatBox
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              disabled={documents.length === 0}
              sessionId={currentSessionId}
            />
          </div>
        </div>
      </div>

      <SessionSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        onLoadSession={handleLoadSession}
        onNewChat={handleNewChat}
      />
    </div>
  );
}

export default App;
