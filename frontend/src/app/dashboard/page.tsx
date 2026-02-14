'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTasks, Task, TaskFilters } from '@/services/taskService';
import AddTask from '../../components/AddTask';
import TaskItem from '../../components/TaskItem';
import TaskFilter from '../../components/TaskFilter';
import { useToast, ToastContainer } from '../../hooks/useToast';

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({});
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();

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
  }, [router, filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const fetchedTasks = await getTasks(filters);
      setTasks(fetchedTasks);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: TaskFilters) => {
    setFilters(newFilters);
  };

  const handleAddTask = (newTask: Task) => {
    setTasks([newTask, ...tasks]);
  };

  const handleOptimisticTaskUpdate = (optimisticTask: Task, realTask: Task | null) => {
    if (realTask) {
      // Replace temporary task with real one from server
      setTasks(tasks.map(task => (task._id === optimisticTask._id ? realTask : task)));
    }
  };

  const handleAddTaskError = (errorMessage: string, optimisticId: string) => {
    // Remove the optimistic task
    setTasks(tasks.filter(task => task._id !== optimisticId));
    // Show error toast
    showToast(errorMessage, 'error');
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(tasks.map(task => (task._id === updatedTask._id ? updatedTask : task)));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task._id !== id));
  };

  const handleTaskError = (errorMessage: string, task: Task) => {
    // Restore the task if it was deleted, or it's already restored in TaskItem for updates
    const taskExists = tasks.find(t => t._id === task._id);
    if (!taskExists) {
      // Task was deleted, restore it
      setTasks([...tasks, task]);
    }
    // Show error toast
    showToast(errorMessage, 'error');
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
    <main className='min-h-screen bg-gray-50 py-8'>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>My Tasks</h1>
            <p className='mt-2 text-gray-600'>Manage and track your tasks efficiently</p>
          </div>
          <button
            onClick={handleLogout}
            className='inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors'>
            <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
              />
            </svg>
            Logout
          </button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
          {/* Left Column - Add Task + Filters */}
          <div className='lg:col-span-1 space-y-6'>
            <AddTask
              onAdd={handleAddTask}
              onOptimisticUpdate={handleOptimisticTaskUpdate}
              onError={handleAddTaskError}
            />
            <TaskFilter onFilterChange={handleFilterChange} activeFilters={filters} />
          </div>

          {/* Right Column - Task List */}
          <div className='lg:col-span-3'>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-gray-900'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h2 className='text-xl font-semibold text-gray-800'>Task List</h2>
                  {(filters.status || filters.dueDateFrom || filters.dueDateTo) && (
                    <p className='text-xs text-blue-600 mt-1'>
                      Filtered results ({tasks.length} {tasks.length === 1 ? 'task' : 'tasks'})
                    </p>
                  )}
                </div>
                <div className='text-sm text-gray-500'>
                  {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                </div>
              </div>

              <div className='space-y-4'>
                {tasks.length === 0 ? (
                  <div className='text-center py-12'>
                    <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <svg
                        className='w-8 h-8 text-gray-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                        />
                      </svg>
                    </div>
                    <h3 className='text-lg font-medium text-gray-900 mb-2'>
                      {filters.status || filters.dueDateFrom || filters.dueDateTo
                        ? 'No tasks match your filters'
                        : 'No tasks yet'}
                    </h3>
                    <p className='text-gray-500'>
                      {filters.status || filters.dueDateFrom || filters.dueDateTo
                        ? 'Try adjusting your filters to see more results.'
                        : 'Get started by adding your first task using the form on the left.'}
                    </p>
                  </div>
                ) : (
                  tasks.map(task => (
                    <TaskItem
                      onError={handleTaskError}
                      key={task._id}
                      task={task}
                      onUpdate={handleUpdateTask}
                      onDelete={handleDeleteTask}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
