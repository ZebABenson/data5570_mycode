import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { API_BASE_URL } from '@/constants/api';

export type Task = {
  id: number;
  text: string;
  done: boolean;
  created_at: string;
};

type TasksState = {
  items: Task[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: TasksState = {
  items: [],
  status: 'idle',
  error: null,
};

// GET /api/tasks/ -- loads the task list from the Django backend.
export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  const response = await fetch(`${API_BASE_URL}/api/tasks/`);
  if (!response.ok) {
    throw new Error(`Failed to load tasks (${response.status})`);
  }
  return (await response.json()) as Task[];
});

// POST /api/tasks/ -- creates a new task on the backend.
export const addTask = createAsyncThunk('tasks/addTask', async (text: string) => {
  const response = await fetch(`${API_BASE_URL}/api/tasks/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create task (${response.status})`);
  }
  return (await response.json()) as Task;
});

// PATCH /api/tasks/:id/ -- flips a task's done state on the backend.
export const toggleTask = createAsyncThunk(
  'tasks/toggleTask',
  async ({ id, done }: { id: number; done: boolean }) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update task (${response.status})`);
    }
    return (await response.json()) as Task;
  }
);

// DELETE /api/tasks/:id/ -- removes a task on the backend.
export const removeTask = createAsyncThunk('tasks/removeTask', async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(`Failed to delete task (${response.status})`);
  }
  return id;
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load tasks';
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(toggleTask.fulfilled, (state, action) => {
        const task = state.items.find((item) => item.id === action.payload.id);
        if (task) {
          task.done = action.payload.done;
        }
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export default tasksSlice.reducer;
