'use client';

import { useState } from 'react';
import { createTask, Task } from '@/services/taskService';

interface AddTaskProps {
  onAdd: (task: Task) => void;
}

export default function AddTask({ onAdd }: AddTaskProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'pending' | 'completed'>('pending');
  const [dueDate, setDueDate] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsAdding(true);
    try {
      const newTask = await createTask({
        title,
        description,
        status,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined
      });
      onAdd(newTask);
      setTitle('');
      setDescription('');
      setStatus('pending');
      setDueDate('');
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='border rounded-lg p-4 mb-4 bg-white shadow text-gray-900'>
      <h2 className='text-xl font-semibold mb-4'>Add New Task</h2>
      <div className='mb-4'>
        <label htmlFor='title-input' className='block text-sm font-medium text-gray-700 mb-1'>
          Title
        </label>
        <input
          id='title-input'
          type='text'
          value={title}
          onChange={e => setTitle(e.target.value)}
          className='w-full p-2 border rounded'
          placeholder='Task title'
          required
        />
      </div>
      <div className='mb-4'>
        <label
          htmlFor='description-textarea'
          className='block text-sm font-medium text-gray-700 mb-1'>
          Description
        </label>
        <textarea
          id='description-textarea'
          value={description}
          onChange={e => setDescription(e.target.value)}
          className='w-full p-2 border rounded'
          placeholder='Description (optional)'
          rows={3}
        />
      </div>
      <div className='mb-4'>
        <label htmlFor='status-select' className='block text-sm font-medium text-gray-700 mb-1'>
          Status
        </label>
        <select
          id='status-select'
          value={status}
          onChange={e => setStatus(e.target.value as 'pending' | 'completed')}
          className='w-full p-2 border rounded'>
          <option value='pending'>Pending</option>
          <option value='completed'>Completed</option>
        </select>
      </div>
      <div className='mb-4'>
        <label htmlFor='due-date-input' className='block text-sm font-medium text-gray-700 mb-1'>
          Due Date
        </label>
        <input
          id='due-date-input'
          type='date'
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className='w-full p-2 border rounded'
          title='Due Date'
        />
      </div>
      <button
        type='submit'
        disabled={isAdding}
        className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400'>
        {isAdding ? 'Adding...' : 'Add Task'}
      </button>
    </form>
  );
}
