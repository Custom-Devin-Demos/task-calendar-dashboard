import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

export const useTasksStore = create(
  persist(
    (set, get) => ({
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
      })),
    }),
    {
      name: 'tasks',
      storage: {
        getItem: (name) => {
          const item = localStorage.getItem(name);
          if (!item) return null;
          const parsed = JSON.parse(item);
          if (parsed.state?.tasks) {
            parsed.state.tasks = parsed.state.tasks.map(task => ({
              ...task,
              id: task.id || nanoid()
            }));
          }
          return parsed;
        },
        setItem: (name, value) => localStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
