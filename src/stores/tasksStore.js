import { create } from 'zustand';
import { nanoid } from 'nanoid';

export const useTasksStore = create((set, get) => ({
  tasks: [],
  
  setTasks: (tasks) => set({ tasks }),
  
  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, { id: nanoid(), ...task }]
  })),
  
  editTask: (updatedTask) => set((state) => ({
    tasks: state.tasks.map(task => 
      task.id === updatedTask.id 
        ? { ...task, ...updatedTask }
        : task
    )
  })),
  
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(task => String(task.id) !== String(id))
  }))
}));
