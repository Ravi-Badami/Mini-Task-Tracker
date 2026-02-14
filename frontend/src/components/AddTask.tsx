'use client';

import { useState } from 'react';
import { createTask, Task } from '@/services/taskService';

interface AddTaskProps {
  onAdd: (task: Task) => void;
  onOptimisticUpdate?: (optimisticTask: Task, realTask: Task | null) => void;
  onError?: (error: string, optimisticId: string) => void;
}

export default function AddTask({ onAdd, onOptimisticUpdate, onError }: AddTaskProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'pending' | 'completed'>('pending');
  const [dueDate, setDueDate] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsAdding(true);

    // Create optimistic task with temporary ID
    const optimisticId = `temp-${Date.now()}`;
    const optimisticTask: Task = {
      _id: optimisticId,
      title,
      description,
      status,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      createdAt: new Date().toISOString()
    };

    // Immediately update UI (optimistic)
    onAdd(optimisticTask);

    try {
      // Send actual API request
      const newTask = await createTask({
        title,
        description,
        status,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined
      });

      // Update with real task data
      onOptimisticUpdate?.(optimisticTask, newTask);

      // Clear form only on success
      setTitle('');
      setDescription('');
      setStatus('pending');
      setDueDate('');
    } catch (error) {
      console.error('Failed to create task:', error);
      // Notify parent to remove optimistic task and show error
      onError?.('Failed to create task. Please try again.', optimisticId);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className='bg-white rounded-xl shadow-md border border-gray-100 p-6 text-gray-900'>
      <div className='flex items-center mb-6'>
        <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3'>
          <svg
            className='w-5 h-5 text-blue-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 6v6m0 0v6m0-6h6m-6 0H6'
            />
          </svg>
        </div>
        <h2 className='text-xl font-semibold text-gray-800'>Add New Task</h2>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label htmlFor='title-input' className='block text-sm font-medium text-gray-700 mb-2'>
            Title
          </label>
          <input
            id='title-input'
            type='text'
            value={title}
            onChange={e => setTitle(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
            placeholder='Enter task title'
            required
          />
        </div>

        <div>
          <label
            htmlFor='description-textarea'
            className='block text-sm font-medium text-gray-700 mb-2'>
            Description
          </label>
          <textarea
            id='description-textarea'
            value={description}
            onChange={e => setDescription(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none'
            placeholder='Add a description (optional)'
            rows={3}
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label htmlFor='status-select' className='block text-sm font-medium text-gray-700 mb-2'>
              Status
            </label>
            <select
              id='status-select'
              value={status}
              onChange={e => setStatus(e.target.value as 'pending' | 'completed')}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'>
              <option value='pending'>Pending</option>
              <option value='completed'>Completed</option>
            </select>
          </div>

          <div>
            <label
              htmlFor='due-date-input'
              className='block text-sm font-medium text-gray-700 mb-2'>
              Due Date
            </label>
            <input
              id='due-date-input'
              type='date'
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
            />
          </div>
        </div>

        <button
          type='submit'
          disabled={isAdding}
          className='w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium flex items-center justify-center gap-2'>
          {isAdding ? (
            <>
              <svg className='animate-spin w-4 h-4' fill='none' viewBox='0 0 24 24'>
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
              </svg>
              Adding Task...
            </>
          ) : (
            <>
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                />
              </svg>
              Add Task
            </>
          )}
        </button>
      </form>
    </div>
  );
}
