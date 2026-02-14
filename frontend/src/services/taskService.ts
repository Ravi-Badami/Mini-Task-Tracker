const API_BASE_URL = 'http://localhost:5000';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  dueDate?: string;
  createdAt: string;
}

export const getTasks = async (): Promise<Task[]> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  const response = await fetch(`${API_BASE_URL}/api/tasks`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }

  return response.json();
};

export const createTask = async (task: Omit<Task, '_id' | 'createdAt'>): Promise<Task> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  const response = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(task)
  });

  if (!response.ok) {
    throw new Error('Failed to create task');
  }

  return response.json();
};

export const updateTask = async (
  id: string,
  task: Partial<Omit<Task, '_id' | 'createdAt'>>
): Promise<Task> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(task)
  });

  if (!response.ok) {
    throw new Error('Failed to update task');
  }

  return response.json();
};

export const deleteTask = async (id: string): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to delete task');
  }
};
