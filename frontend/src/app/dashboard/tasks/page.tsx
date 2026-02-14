'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTasks, Task } from '@/services/taskService';
import AddTask from '../../../components/AddTask';
import TaskItem from '../../../components/TaskItem';


export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    router.push('/');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    fetchTasks();
  }, [router]);

  const fetchTasks = async () => {
    try {
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = (newTask: Task) => {
    setTasks([newTask, ...tasks]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(tasks.map(task => (task._id === updatedTask._id ? updatedTask : task)));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task._id !== id));
  };

  if (loading) {
    return (
      <main className='flex min-h-screen flex-col items-center justify-center p-8'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading tasks...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className='flex min-h-screen flex-col items-center justify-center p-8'>
        <div className='text-center'>
          <div className='text-red-500 text-xl mb-4'>Error</div>
          <p className='text-gray-600'>{error}</p>
          <button
            onClick={fetchTasks}
            className='mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'>
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className='min-h-screen p-8 bg-gray-100'>
      <div className='max-w-4xl mx-auto'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold'>My Tasks</h1>
          <div className='flex gap-2'>
            <button
              onClick={() => router.push('/dashboard')}
              className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600'>
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'>
              Logout
            </button>
          </div>
        </div>

        <AddTask onAdd={handleAddTask} />

        <div className='space-y-4'>
          {tasks.length === 0 ? (
            <div className='text-center py-8'>
              <p className='text-gray-500 text-lg'>No tasks yet. Add your first task above!</p>
            </div>
          ) : (
            tasks.map(task => (
              <TaskItem
                key={task._id}
                task={task}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
