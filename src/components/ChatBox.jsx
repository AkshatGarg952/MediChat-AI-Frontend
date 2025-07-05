import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Loader2, Bot, User, FileText } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

const ChatBox = ({ messages, onSendMessage, disabled, sessionId }) => {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSupported, setRecordingSupported] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [lastInputWasVoice, setLastInputWasVoice] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    setRecordingSupported(!!navigator.mediaDevices && !!window.MediaRecorder);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit called'); // Debug log
    if (!inputValue.trim() || disabled || isProcessingVoice) {
      console.log('Submission blocked:', { inputValue, disabled, isProcessingVoice });
      return;
    }

    if (!sessionId) {
      console.error('sessionId is undefined');
      onSendMessage('❌ Session ID is missing. Please try again.', 'text', 'bot', 'text');
      return;
    }

    // Send the message to the parent via onSendMessage
    onSendMessage(inputValue.trim(), 'text', 'user', lastInputWasVoice ? 'voice' : 'text');
    setInputValue('');
    setLastInputWasVoice(false);
  };

  const toggleRecording = async () => {
    if (!recordingSupported) return;
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        stream.getTracks().forEach((track) => track.stop());

        if (!audioBlob.type.startsWith('audio/')) {
          onSendMessage('❌ Unsupported audio format.', 'text', 'bot', 'text');
          setIsProcessingVoice(false);
          return;
        }

        await processVoiceQuery(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setInputValue('');
      setIsRecording(true);
      setIsProcessingVoice(true);
      mediaRecorder.start();
    } catch (error) {
      console.error('🎙️ Error starting recording:', error);
      setIsRecording(false);
      setIsProcessingVoice(false);
      onSendMessage(`🎙️ Microphone access denied or unavailable.`, 'text', 'bot', 'text');
    }
  };

  const stopRecording = async () => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
      resolve();
    });
  };

  const processVoiceQuery = async (audioBlob) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'recording.webm');

      const response = await fetch(`${API_BASE_URL}/chat/ask/${sessionId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Voice query failed');
      }

      const data = await response.json();
      const transcript = data.query;
      const answer = data.answer;

      if (!transcript) throw new Error('No transcription received');

      console.log('Transcription completed:', transcript);
      // setInputValue(transcript);
      setLastInputWasVoice(true);
      // Send transcription as a user message
      onSendMessage(transcript, 'text', 'user', 'voice', true);

      
onSendMessage(answer || '⚠️ No answer returned from backend.', 'text', 'bot', 'text');

// Attempt to play audio response
if (data.audio_url) {
  console.log("Playinh the audio!");  
  try {
    if (window.lastAudio && !window.lastAudio.paused) {
      window.lastAudio.pause();
    }
    const audio = new Audio(data.audio_url);
    window.lastAudio = audio;
    await audio.play();
  } catch (err) {
    console.warn('🔇 Audio playback failed:', err);
  }
}

    } catch (err) {
      console.error('🎤 Voice query failed:', err);
      onSendMessage('❌ Failed to process your voice query. Please try again.', 'text', 'bot', 'text');
      setLastInputWasVoice(false);
    } finally {
      setIsProcessingVoice(false);
      console.log('processVoiceQuery finished');
    }
  };

  const handleDownloadSummary = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token || !sessionId) {
        alert('Missing session ID or auth token');
        return;
      }

      setSummaryLoading(true);

      const response = await fetch(`${API_BASE_URL}/chat/summarize/${sessionId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Summary fetch failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DocAI_Session_${sessionId}_Summary.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Summary download error:', error);
      onSendMessage('❌ Failed to download summary PDF. Try again later.', 'text', 'bot', 'text');
    } finally {
      setSummaryLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="relative">
      {summaryLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-95">
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <span className="text-xl font-semibold text-gray-800">Getting Summary...</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Chat</h2>
          <button
            onClick={handleDownloadSummary}
            className="text-sm text-blue-600 hover:underline flex items-center space-x-1"
            disabled={summaryLoading}
          >
            <FileText className="h-4 w-4" />
            <span>Download Summary</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Upload documents and start asking questions about them
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0">
                      {message.type === 'user' ? (
                        <User className="h-4 w-4 mt-0.5 opacity-75" />
                      ) : (
                        <Bot className="h-4 w-4 mt-0.5 opacity-75" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.type === 'user' && message.source === 'voice' && (
                          <Mic className="h-3 w-3 opacity-75" title="Sent via voice" />
                        )}
                      </div>
                      <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <form onSubmit={handleSubmit} className="flex flex-1 space-x-2">
              <input
                type="text"
                name="question"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={disabled ? 'Upload documents first...' : 'Ask a question...'}
                disabled={disabled || isProcessingVoice}
                className="w-full px-4 py-3 border rounded-lg"
                required
              />
              <button
                type="submit"
                className="px-4 py-3 bg-blue-600 text-white rounded-lg"
                disabled={disabled || isProcessingVoice}
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
            <button
              onClick={toggleRecording}
              className={`px-4 py-3 rounded-lg ${
                isRecording ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-900'
              } ${!recordingSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!recordingSupported}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;