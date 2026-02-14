'use client';

import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    router.push('/');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-lg text-center">
        <div className="mb-6 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="mb-2 text-3xl font-bold">Welcome to Task Tracker</h1>
        <p className="mb-8 text-gray-600">You are logged in successfully.</p>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 className="mb-2 text-lg font-semibold">Dashboard</h2>
          <p className="text-gray-500">Your task tracker is ready. Start managing your tasks!</p>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 rounded-md bg-red-500 px-6 py-2 text-white hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </main>
  );
}
