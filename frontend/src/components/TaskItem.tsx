'use client';

import { useState } from 'react';
import { Task, updateTask, deleteTask } from '@/services/taskService';

interface TaskItemProps {
  task: Task;
  onUpdate: (updatedTask: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState(task.status);
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.split('T')[0] : '');

  const handleSave = async () => {
    try {
      const updatedTask = await updateTask(task._id, {
        title,
        description,
        status,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined
      });
      onUpdate(updatedTask);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(task._id);
      onDelete(task._id);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  return (
    <div className='border rounded-lg p-4 mb-4 bg-white shadow'>
      {isEditing ? (
        <div>
          <div className='mb-2'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Title</label>
            <input
              type='text'
              value={title}
              onChange={e => setTitle(e.target.value)}
              className='w-full p-2 border rounded'
              placeholder='Task title'
            />
          </div>
          <div className='mb-2'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className='w-full p-2 border rounded'
              placeholder='Description'
            />
          </div>
          <div className='mb-2'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as 'pending' | 'completed')}
              className='w-full p-2 border rounded'
              title='Select task status'>
              <option value='pending'>Pending</option>
              <option value='completed'>Completed</option>
            </select>
          </div>
          <div className='mb-2'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Due Date</label>
            <input
              type='date'
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className='w-full p-2 border rounded'
              title='Select due date'
            />
          </div>
          <div className='flex gap-2'>
            <button
              onClick={handleSave}
              className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'>
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600'>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h3
            className={`text-lg font-semibold ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
            {task.title}
          </h3>
          {task.description && <p className='text-gray-600 mb-2'>{task.description}</p>}
          <p className='text-sm text-gray-500'>Status: {task.status}</p>
          {task.dueDate && (
            <p className='text-sm text-gray-500'>
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </p>
          )}
          <div className='flex gap-2 mt-2'>
            <button
              onClick={() => setIsEditing(true)}
              className='bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600'>
              Edit
            </button>
            <button
              onClick={handleDelete}
              className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
