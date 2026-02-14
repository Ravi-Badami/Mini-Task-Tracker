'use client';

import { useState } from 'react';
import { Task, updateTask, deleteTask } from '@/services/taskService';

interface TaskItemProps {
  task: Task;
  onUpdate: (updatedTask: Task) => void;
  onDelete: (id: string) => void;
  onError?: (error: string, task: Task) => void;
}

export default function TaskItem({ task, onUpdate, onDelete, onError }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState(task.status);
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.split('T')[0] : '');
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if this is an optimistic task (temporary ID)
  const isOptimistic = task._id.startsWith('temp-');

  const handleSave = async () => {
    const previousTask = { ...task };

    // Create optimistic update
    const optimisticTask: Task = {
      ...task,
      title,
      description,
      status,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined
    };

    // Immediately update UI (optimistic)
    onUpdate(optimisticTask);
    setIsEditing(false);

    try {
      // Send actual API request
      const updatedTask = await updateTask(task._id, {
        title,
        description,
        status,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined
      });

      // Update with real task data from server
      onUpdate(updatedTask);
    } catch (error) {
      console.error('Failed to update task:', error);
      // Revert to previous state
      onUpdate(previousTask);
      setTitle(previousTask.title);
      setDescription(previousTask.description || '');
      setStatus(previousTask.status);
      setDueDate(previousTask.dueDate ? previousTask.dueDate.split('T')[0] : '');
      onError?.('Failed to update task. Please try again.', previousTask);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    const taskToDelete = { ...task };

    // Immediately remove from UI (optimistic)
    onDelete(task._id);

    try {
      // Send actual API request
      await deleteTask(task._id);
      // Success - task already removed from UI
    } catch (error) {
      console.error('Failed to delete task:', error);
      // Restore task in UI
      onError?.('Failed to delete task. Please try again.', taskToDelete);
      setIsDeleting(false);
    }
  };

  return (
    <div className='bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 overflow-hidden text-gray-900'>
      {isEditing ? (
        <div className='p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-gray-800'>Edit Task</h3>
            <button
              onClick={() => setIsEditing(false)}
              className='text-gray-400 hover:text-gray-600 transition-colors'
              aria-label='Cancel editing'
              title='Cancel editing'>
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>

          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Title</label>
              <input
                type='text'
                value={title}
                onChange={e => setTitle(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
                placeholder='Task title'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none'
                placeholder='Description (optional)'
                rows={3}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as 'pending' | 'completed')}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
                  title='Select task status'>
                  <option value='pending'>Pending</option>
                  <option value='completed'>Completed</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Due Date</label>
                <input
                  type='date'
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
                  title='Select due date'
                />
              </div>
            </div>
          </div>

          <div className='flex gap-3 mt-6'>
            <button
              onClick={handleSave}
              className='flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium'>
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium'>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className='p-6'>
          <div className='flex items-start justify-between mb-3'>
            <div className='flex-1'>
              <h3
                className={`text-lg font-semibold text-gray-800 ${task.status === 'completed' ? 'line-through text-gray-500' : ''} mb-1`}>
                {task.title}
              </h3>
              {task.description && (
                <p className='text-gray-600 text-sm leading-relaxed'>{task.description}</p>
              )}
            </div>
            <div className='flex gap-2 ml-4'>
              <button
                onClick={() => setIsEditing(true)}
                className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                title='Edit task'>
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                  />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                title='Delete task'>
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  task.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                <svg
                  className={`w-3 h-3 mr-1 ${task.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}
                  fill='currentColor'
                  viewBox='0 0 20 20'>
                  {task.status === 'completed' ? (
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  ) : (
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                      clipRule='evenodd'
                    />
                  )}
                </svg>
                {task.status === 'completed' ? 'Completed' : 'Pending'}
              </span>

              {isOptimistic && (
                <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                  <svg className='animate-spin w-3 h-3 mr-1' fill='none' viewBox='0 0 24 24'>
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
                  Syncing...
                </span>
              )}

              {task.dueDate && (
                <div className='flex items-center text-sm text-gray-500'>
                  <svg
                    className='w-4 h-4 mr-1'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                    />
                  </svg>
                  {new Date(task.dueDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
