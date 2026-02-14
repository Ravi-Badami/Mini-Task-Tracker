'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const verified = searchParams.get('verified');

  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [loading, setLoading] = useState(false);
  const [showCheckEmail, setShowCheckEmail] = useState(false);

  useEffect(() => {
    if (verified === 'true') {
      setIsLogin(true);
      setMessage('Email verified successfully! You can now log in.');
      setMessageType('success');
    }
  }, [verified]);

  const [registeredEmail, setRegisteredEmail] = useState('');

  // Poll for email verification status
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (showCheckEmail && registeredEmail) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:5000/auth/check-verification-status?email=${encodeURIComponent(registeredEmail)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.verified) {
              // User is verified! Redirect to login
              setShowCheckEmail(false);
              setIsLogin(true);
              setFormData(prev => ({ ...prev, email: registeredEmail, password: '' })); // Pre-fill email
              setMessage('Email verified! Please log in.');
              setMessageType('success');
            }
          }
        } catch (error) {
          console.error('Error checking verification status:', error);
        }
      }, 3000);
    }

    return () => clearInterval(intervalId);
  }, [showCheckEmail, registeredEmail]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    // Don't hide check email screen immediately if just resending or something, 
    // but here we are submitting login/register form.
    setShowCheckEmail(false);

    const endpoint = isLogin
      ? 'http://localhost:5000/auth/login'
      : 'http://localhost:5000/users/register';
    const bodyData = isLogin ? { email: formData.email, password: formData.password } : formData;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          // Store tokens and redirect to dashboard
          localStorage.setItem('token', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
          setMessage('Login successful! Redirecting...');
          setMessageType('success');
          setTimeout(() => {
            router.push('/dashboard/tasks');
          }, 1000);
        } else {
          // Registration successful — show check email message and start polling
          setRegisteredEmail(formData.email);
          setShowCheckEmail(true);
          setFormData({ name: '', email: '', password: '' });
        }
      } else {
        setMessage(data.message || `${isLogin ? 'Login' : 'Registration'} failed`);
        setMessageType('error');
      }
    } catch {
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const emailToResend = formData.email || registeredEmail;
    
    if (!emailToResend) {
      setMessage('Please enter your email address first.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToResend }),
      });

      if (response.ok) {
        setMessage('Verification email resent! Check your inbox.');
        setMessageType('success');
      } else {
        const data = await response.json();
        setMessage(data.message || 'Failed to resend verification email.');
        setMessageType('error');
      }
    } catch {
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Show "check your email" screen after registration
  if (showCheckEmail) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-8 w-8 text-blue-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold">Check Your Email</h1>
          <p className="mb-2 text-gray-600">
            We&apos;ve sent a verification link to <strong>{registeredEmail}</strong>.
          </p>
          <p className="mb-6 text-sm text-gray-500">
            Click the link in your email to verify your account. This page will automatically refresh once you&apos;re verified.
          </p>
          
          <div className="flex flex-col gap-3">
             <button
              onClick={handleResendVerification}
              disabled={loading}
              className="text-blue-500 text-sm hover:underline disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Resend verification email'}
            </button>
            
            <button
              onClick={() => {
                setShowCheckEmail(false);
                setIsLogin(true);
                setMessage('');
              }}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Back to Login
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md">
        <div className="flex mb-6">
          <button
            onClick={() => { setIsLogin(false); setMessage(''); }}
            className={`flex-1 py-2 px-4 text-center ${!isLogin ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} rounded-l-md`}
          >
            Register
          </button>
          <button
            onClick={() => { setIsLogin(true); setMessage(''); }}
            className={`flex-1 py-2 px-4 text-center ${isLogin ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} rounded-r-md`}
          >
            Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading
              ? `${isLogin ? 'Logging in...' : 'Registering...'}`
              : isLogin
                ? 'Login'
                : 'Register'}
          </button>
        </form>

        {/* Resend verification link (shown on login tab) */}
        {isLogin && (
          <button
            onClick={handleResendVerification}
            className="mt-3 w-full text-sm text-blue-500 hover:text-blue-700 underline"
          >
            Resend verification email
          </button>
        )}

        {message && (
          <p
            className={`mt-4 text-center ${
              messageType === 'success'
                ? 'text-green-600'
                : messageType === 'error'
                  ? 'text-red-600'
                  : 'text-blue-600'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center"><p>Loading...</p></main>}>
      <HomeContent />
    </Suspense>
  );
}
