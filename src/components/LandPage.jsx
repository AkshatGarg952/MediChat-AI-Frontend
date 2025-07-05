import React, { useState } from 'react';
import { MessageSquare, Upload, Zap, Shield, ChevronRight, Loader2 } from 'lucide-react';

const Modal = ({ show, onClose, children }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md transform transition-all relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

export default function DocumentChatLanding() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://127.0.0.1:8000';

  const saveToken = (token) => {
    localStorage.setItem('authToken', token);
  };

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (response.ok) {
        saveToken(data.token);
        setShowLogin(false);
        setLoginForm({ email: '', password: '' });
        window.location.href = '/mainPage';
      } else {
        setError(data.detail || data.message || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    const { name, email, password, confirmPassword } = registerForm;
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        saveToken(data.token);
        setShowRegister(false);
        setRegisterForm({ name: '', email: '', password: '', confirmPassword: '' });
        window.location.href = '/mainPage';
      } else {
        setError(data.detail || data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DocumentChat AI
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowLogin(true)}
              className="px-6 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => setShowRegister(true)}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-medium"
            >
              Get Started
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20 text-center max-w-7xl mx-auto">
        <div className="mb-8 inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
          <Zap className="w-4 h-4" />
          <span>Powered by Advanced AI</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent leading-tight">
          Chat with Your <br />
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Documents
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
          Upload your PDFs and Word documents, then ask questions and get instant, intelligent answers.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setShowRegister(true)}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all flex items-center space-x-2"
          >
            <span>Start Chatting</span>
            <ChevronRight className="w-5 h-5" />
          </button>
          <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-semibold text-lg hover:border-blue-300 hover:text-blue-600 transition-all">
            Watch Demo
          </button>
        </div>
      </section>

      {/* Login Modal */}
      <Modal show={showLogin} onClose={() => !isLoading && setShowLogin(false)}>
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Welcome Back</h2>
        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={loginForm.email || ''}
              onChange={(e) => {
                setError('');
                setLoginForm({ ...loginForm, email: e.target.value });
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={loginForm.password || ''}
              onChange={(e) => {
                setError('');
                setLoginForm({ ...loginForm, password: e.target.value });
              }}
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </div>
        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={() => {
              if (!isLoading) {
                setShowLogin(false);
                setShowRegister(true);
                setError('');
              }
            }}
            className="text-blue-600 hover:underline"
          >
            Sign up
          </button>
        </p>
      </Modal>

      {/* Register Modal */}
      <Modal show={showRegister} onClose={() => !isLoading && setShowRegister(false)}>
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Create Account</h2>
        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">{error}</div>}
        <div className="space-y-4">
          {['name', 'email', 'password', 'confirmPassword'].map((field, idx) => (
            <div key={idx}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field === 'confirmPassword' ? 'Confirm Password' : field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                type={field.includes('password') ? 'password' : 'text'}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={registerForm[field] || ''}
                onChange={(e) => {
                  setError('');
                  setRegisterForm({ ...registerForm, [field]: e.target.value });
                }}
              />
            </div>
          ))}
          <button
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </div>
        <p className="mt-4 text-center text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => {
              if (!isLoading) {
                setShowRegister(false);
                setShowLogin(true);
                setError('');
              }
            }}
            className="text-blue-600 hover:underline"
          >
            Sign in
          </button>
        </p>
      </Modal>
    </div>
  );
}
