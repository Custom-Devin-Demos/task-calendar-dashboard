import { renderHook, act } from '@testing-library/react';
import { useTasksStore } from './tasksStore';

let mockIdCounter = 0;
jest.mock('nanoid', () => ({
  nanoid: () => `test-id-${++mockIdCounter}`
}));

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;


describe('useTasksStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    mockIdCounter = 0;
    
    useTasksStore.setState({ tasks: [] });
  });

  describe('Task CRUD Operations', () => {
    test('should initialize with empty tasks array', () => {
      const { result } = renderHook(() => useTasksStore());
      expect(result.current.tasks).toEqual([]);
    });

    test('should add a task with generated ID', () => {
      const { result } = renderHook(() => useTasksStore());
      const newTask = {
        title: 'Test Task',
        description: 'Test Description',
        category: 'success',
        date: '2025-08-29'
      };

      act(() => {
        result.current.addTask(newTask);
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0]).toEqual({
        id: 'test-id-1',
        ...newTask
      });
    });

    test('should add multiple tasks with different categories', () => {
      const { result } = renderHook(() => useTasksStore());
      
      const tasks = [
        { title: 'Task 1', category: 'success', date: '2025-08-29' },
        { title: 'Task 2', category: 'warning', date: '2025-08-30' },
        { title: 'Task 3', category: 'issue', date: '2025-08-31' }
      ];

      act(() => {
        tasks.forEach(task => result.current.addTask(task));
      });

      expect(result.current.tasks).toHaveLength(3);
      expect(result.current.tasks.map(t => t.category)).toEqual(['success', 'warning', 'issue']);
    });

    test('should edit an existing task', () => {
      const { result } = renderHook(() => useTasksStore());
      
      act(() => {
        result.current.addTask({
          title: 'Original Task',
          description: 'Original Description',
          category: 'success',
          date: '2025-08-29'
        });
      });

      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.editTask({
          id: taskId,
          title: 'Updated Task',
          description: 'Updated Description',
          category: 'warning'
        });
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0]).toEqual({
        id: taskId,
        title: 'Updated Task',
        description: 'Updated Description',
        category: 'warning',
        date: '2025-08-29'
      });
    });

    test('should not edit non-existent task', () => {
      const { result } = renderHook(() => useTasksStore());
      
      act(() => {
        result.current.addTask({
          title: 'Test Task',
          category: 'success',
          date: '2025-08-29'
        });
      });

      const originalTasks = [...result.current.tasks];

      act(() => {
        result.current.editTask({
          id: 'non-existent-id',
          title: 'Updated Task'
        });
      });

      expect(result.current.tasks).toEqual(originalTasks);
    });

    test('should delete a task by ID', () => {
      const { result } = renderHook(() => useTasksStore());
      
      act(() => {
        result.current.setTasks([]);
        result.current.addTask({ title: 'Task 1', category: 'success', date: '2025-08-29' });
        result.current.addTask({ title: 'Task 2', category: 'warning', date: '2025-08-30' });
      });

      expect(result.current.tasks).toHaveLength(2);
      const taskIdToDelete = result.current.tasks[0].id;

      act(() => {
        result.current.deleteTask(taskIdToDelete);
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].title).toBe('Task 2');
    });

    test('should handle string ID comparison in deleteTask', () => {
      const { result } = renderHook(() => useTasksStore());
      
      act(() => {
        result.current.addTask({ title: 'Test Task', category: 'success', date: '2025-08-29' });
      });

      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.deleteTask(String(taskId));
      });

      expect(result.current.tasks).toHaveLength(0);
    });

    test('should set tasks array directly', () => {
      const { result } = renderHook(() => useTasksStore());
      
      const tasksToSet = [
        { id: '1', title: 'Task 1', category: 'success', date: '2025-08-29' },
        { id: '2', title: 'Task 2', category: 'warning', date: '2025-08-30' }
      ];

      act(() => {
        result.current.setTasks(tasksToSet);
      });

      expect(result.current.tasks).toEqual(tasksToSet);
    });
  });

  describe('Store Actions', () => {
    test('should handle bulk task operations', () => {
      const { result } = renderHook(() => useTasksStore());
      
      const bulkTasks = [
        { id: '1', title: 'Bulk Task 1', category: 'success', date: '2025-08-29' },
        { id: '2', title: 'Bulk Task 2', category: 'warning', date: '2025-08-30' }
      ];

      act(() => {
        result.current.setTasks(bulkTasks);
      });

      expect(result.current.tasks).toEqual(bulkTasks);
      expect(result.current.tasks).toHaveLength(2);
    });

    test('should maintain task data integrity across operations', () => {
      const { result } = renderHook(() => useTasksStore());
      
      act(() => {
        result.current.setTasks([]);
        result.current.addTask({ title: 'Task 1', category: 'success', date: '2025-08-29' });
        result.current.addTask({ title: 'Task 2', category: 'warning', date: '2025-08-30' });
      });

      const firstTaskId = result.current.tasks[0].id;
      
      act(() => {
        result.current.editTask({ id: firstTaskId, title: 'Updated Task 1' });
      });

      expect(result.current.tasks).toHaveLength(2);
      expect(result.current.tasks[0].title).toBe('Updated Task 1');
      expect(result.current.tasks[1].title).toBe('Task 2');
    });
  });
});
