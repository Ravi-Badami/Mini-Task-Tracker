'use client';

import { useState } from 'react';
import { TaskFilters } from '@/services/taskService';

interface TaskFilterProps {
  onFilterChange: (filters: TaskFilters) => void;
  activeFilters: TaskFilters;
}

export default function TaskFilter({ onFilterChange, activeFilters }: TaskFilterProps) {
  const [status, setStatus] = useState<'all' | 'pending' | 'completed'>(
    activeFilters.status || 'all'
  );
  const [dueDateFrom, setDueDateFrom] = useState(activeFilters.dueDateFrom || '');
  const [dueDateTo, setDueDateTo] = useState(activeFilters.dueDateTo || '');

  const handleStatusChange = (newStatus: 'all' | 'pending' | 'completed') => {
    setStatus(newStatus);
    const filters: TaskFilters = { ...activeFilters };

    if (newStatus === 'all') {
      delete filters.status;
    } else {
      filters.status = newStatus;
    }

    onFilterChange(filters);
  };

  const handleDateFromChange = (date: string) => {
    setDueDateFrom(date);
    const filters: TaskFilters = { ...activeFilters };

    if (date) {
      filters.dueDateFrom = date;
    } else {
      delete filters.dueDateFrom;
    }

    onFilterChange(filters);
  };

  const handleDateToChange = (date: string) => {
    setDueDateTo(date);
    const filters: TaskFilters = { ...activeFilters };

    if (date) {
      filters.dueDateTo = date;
    } else {
      delete filters.dueDateTo;
    }

    onFilterChange(filters);
  };

  const handleClearFilters = () => {
    setStatus('all');
    setDueDateFrom('');
    setDueDateTo('');
    onFilterChange({});
  };

  const hasActiveFilters = status !== 'all' || dueDateFrom || dueDateTo;

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-gray-800'>Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className='text-sm text-blue-600 hover:text-blue-700 font-medium'>
            Clear All
          </button>
        )}
      </div>

      <div className='space-y-4'>
        {/* Status Filter */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>Status</label>
          <div className='flex flex-col space-y-2'>
            <button
              onClick={() => handleStatusChange('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              All Tasks
            </button>
            <button
              onClick={() => handleStatusChange('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              Pending
            </button>
            <button
              onClick={() => handleStatusChange('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === 'completed'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              Completed
            </button>
          </div>
        </div>

        {/* Due Date Filter */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>Due Date Range</label>
          <div className='space-y-3'>
            <div>
              <label htmlFor='date-from' className='block text-xs text-gray-600 mb-1'>
                From
              </label>
              <input
                id='date-from'
                type='date'
                value={dueDateFrom}
                onChange={e => handleDateFromChange(e.target.value)}
                placeholder='Start date'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900'
              />
            </div>
            <div>
              <label htmlFor='date-to' className='block text-xs text-gray-600 mb-1'>
                To
              </label>
              <input
                id='date-to'
                type='date'
                value={dueDateTo}
                onChange={e => handleDateToChange(e.target.value)}
                placeholder='End date'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900'
              />
            </div>
          </div>
        </div>

        {/* Quick Date Filters */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>Quick Filters</label>
          <div className='grid grid-cols-2 gap-2'>
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                handleDateFromChange(today);
                handleDateToChange(today);
              }}
              className='px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'>
              Today
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                handleDateFromChange(today.toISOString().split('T')[0]);
                handleDateToChange(nextWeek.toISOString().split('T')[0]);
              }}
              className='px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'>
              Next 7 Days
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                handleDateFromChange(firstDay.toISOString().split('T')[0]);
                handleDateToChange(lastDay.toISOString().split('T')[0]);
              }}
              className='px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'>
              This Month
            </button>
            <button
              onClick={() => {
                const today = new Date();
                handleDateFromChange('');
                handleDateToChange(today.toISOString().split('T')[0]);
              }}
              className='px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'>
              Overdue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
