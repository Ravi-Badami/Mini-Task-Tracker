'use client';

import { useState } from 'react';

export default function Home() {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const endpoint = isLogin
      ? 'http://localhost:5000/users/login'
      : 'http://localhost:5000/users/register';
    const bodyData = isLogin ? { email: formData.email, password: formData.password } : formData;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          setMessage(`Login successful! Token: ${data.data.token.substring(0, 20)}...`);
          // Store token in localStorage or context
          localStorage.setItem('token', data.data.token);
        } else {
          setMessage('Registration successful!');
          setFormData({ name: '', email: '', password: '' });
        }
      } else {
        setMessage(data.message || `${isLogin ? 'Login' : 'Registration'} failed`);
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-24'>
      <div className='w-full max-w-md'>
        <div className='flex mb-6'>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 text-center ${!isLogin ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} rounded-l-md`}>
            Register
          </button>
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 text-center ${isLogin ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} rounded-r-md`}>
            Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {!isLogin && (
            <div>
              <label htmlFor='name' className='block text-sm font-medium mb-1'>
                Name
              </label>
              <input
                type='text'
                id='name'
                name='name'
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
          )}

          <div>
            <label htmlFor='email' className='block text-sm font-medium mb-1'>
              Email
            </label>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label htmlFor='password' className='block text-sm font-medium mb-1'>
              Password
            </label>
            <input
              type='password'
              id='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50'>
            {loading
              ? `${isLogin ? 'Logging in...' : 'Registering...'}`
              : isLogin
                ? 'Login'
                : 'Register'}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
