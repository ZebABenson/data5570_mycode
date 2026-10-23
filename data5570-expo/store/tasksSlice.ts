import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Task = {
  id: string;
  text: string;
  done: boolean;
};

type TasksState = {
  items: Task[];
};

const initialState: TasksState = {
  items: [],
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<string>) => {
      state.items.push({
        id: Date.now().toString(),
        text: action.payload,
        done: false,
      });
    },
    toggleTask: (state, action: PayloadAction<string>) => {
      const task = state.items.find((item) => item.id === action.payload);
      if (task) {
        task.done = !task.done;
      }
    },
    removeTask: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
});

export const { addTask, toggleTask, removeTask } = tasksSlice.actions;
export default tasksSlice.reducer;
