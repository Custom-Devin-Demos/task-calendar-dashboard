import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

jest.mock('./stores/tasksStore', () => ({
  useTasksStore: jest.fn()
}));

const { useTasksStore } = require('./stores/tasksStore');


describe('App Component', () => {
  const testMockTasks = [
    {
      id: '1',
      title: 'Test Task 1',
      description: 'Test Description 1',
      category: 'success',
      date: '2025-08-29'
    },
    {
      id: '2',
      title: 'Test Task 2',
      description: 'Test Description 2',
      category: 'warning',
      date: '2025-08-30'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useTasksStore.mockReturnValue({
      tasks: [],
      addTask: jest.fn(),
      editTask: jest.fn(),
      deleteTask: jest.fn(),
      setTasks: jest.fn()
    });
  });

  describe('Basic Rendering', () => {
    test('renders Task Calendar Dashboard title', () => {
      render(<App />);
      expect(screen.getByText('Task Calendar Dashboard')).toBeInTheDocument();
    });

    test('renders Add Task button', () => {
      render(<App />);
      expect(screen.getByText('Add Task')).toBeInTheDocument();
    });

    test('renders calendar component', () => {
      render(<App />);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    test('renders task categories chart section', () => {
      render(<App />);
      expect(screen.getByText('Task Categories Chart')).toBeInTheDocument();
    });

    test('shows "No tasks" when no tasks exist', () => {
      useTasksStore.mockReturnValue({
        tasks: [],
        addTask: jest.fn(),
        editTask: jest.fn(),
        deleteTask: jest.fn(),
        setTasks: jest.fn()
      });
      render(<App />);
      expect(screen.getByText('No tasks')).toBeInTheDocument();
    });
  });

  describe('Task Display', () => {
    test('displays tasks for selected date', () => {
      const mockStore = {
        tasks: [testMockTasks[0]],
        addTask: jest.fn(),
        editTask: jest.fn(),
        deleteTask: jest.fn(),
        setTasks: jest.fn()
      };
      
      useTasksStore.mockReturnValue(mockStore);
      
      
      render(<App />);
      
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Description 1')).toBeInTheDocument();
    });

    test('shows Edit and Delete buttons for each task', () => {
      useTasksStore.mockReturnValue({
        tasks: [testMockTasks[0]],
        addTask: jest.fn(),
        editTask: jest.fn(),
        deleteTask: jest.fn(),
        setTasks: jest.fn()
      });
      render(<App />);
      
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    test('filters tasks by selected date', () => {
      useTasksStore.mockReturnValue({
        tasks: [...testMockTasks],
        addTask: jest.fn(),
        editTask: jest.fn(),
        deleteTask: jest.fn(),
        setTasks: jest.fn()
      });
      render(<App />);
      
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Task 2')).not.toBeInTheDocument();
    });
  });

  describe('Task Creation', () => {
    test('opens Add Task modal when Add Task button is clicked', async () => {
      render(<App />);
      
      const addTaskButtons = screen.getAllByRole('button', { name: 'Add Task' });
      const mainAddTaskButton = addTaskButtons.find(btn => btn.type === 'button');
      fireEvent.click(mainAddTaskButton);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter title')).toBeInTheDocument();
      });
    });

    test('creates new task when form is submitted', async () => {
      const mockAddTask = jest.fn();
      useTasksStore.mockReturnValue({
        tasks: [],
        addTask: mockAddTask,
        editTask: jest.fn(),
        deleteTask: jest.fn(),
        setTasks: jest.fn()
      });
      
      render(<App />);
      
      const addTaskButtons = screen.getAllByRole('button', { name: 'Add Task' });
      const mainAddTaskButton = addTaskButtons.find(btn => btn.type === 'button');
      fireEvent.click(mainAddTaskButton);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter title')).toBeInTheDocument();
      });
      
      fireEvent.change(screen.getByPlaceholderText('Enter title'), { target: { value: 'New Task' } });
      fireEvent.change(screen.getByPlaceholderText('Enter description'), { target: { value: 'New Description' } });
      
      const categorySelects = screen.getAllByTestId('mocked-select');
      const modalCategorySelect = categorySelects.find(select => 
        select.closest('.ant-modal')
      );
      
      fireEvent.change(modalCategorySelect, { target: { value: 'success' } });
      
      await waitFor(async () => {
        const submitButtons = screen.getAllByRole('button', { name: 'Add Task' });
        const modalSubmitButton = submitButtons.find(btn => btn.type === 'submit');
        fireEvent.click(modalSubmitButton);
      });
      
      await waitFor(() => {
        expect(mockAddTask).toHaveBeenCalledWith({
          title: 'New Task',
          description: 'New Description',
          category: 'success',
          date: '2025-08-29'
        });
      });
    });
  });

  describe('Task Editing', () => {
    test('opens Edit Task modal when Edit button is clicked', async () => {
      useTasksStore.mockReturnValue({
        tasks: [testMockTasks[0]],
        addTask: jest.fn(),
        editTask: jest.fn(),
        deleteTask: jest.fn(),
        setTasks: jest.fn()
      });
      render(<App />);
      
      fireEvent.click(screen.getByText('Edit'));
      
      expect(screen.getByText('Edit Task')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Task 1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Description 1')).toBeInTheDocument();
    });

    test('updates task when edit form is submitted', async () => {
      const mockEditTask = jest.fn();
      useTasksStore.mockReturnValue({
        tasks: [testMockTasks[0]],
        addTask: jest.fn(),
        editTask: mockEditTask,
        deleteTask: jest.fn(),
        setTasks: jest.fn()
      });
      render(<App />);
      
      fireEvent.click(screen.getByText('Edit'));
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Task 1')).toBeInTheDocument();
      });
      
      const titleInput = screen.getByDisplayValue('Test Task 1');
      fireEvent.change(titleInput, { target: { value: 'Updated Task' } });
      
      const categorySelects = screen.getAllByTestId('mocked-select');
      const modalCategorySelect = categorySelects.find(select => 
        select.closest('.ant-modal')
      );
      
      fireEvent.change(modalCategorySelect, { target: { value: 'success' } });
      
      await waitFor(async () => {
        const updateButton = screen.getByRole('button', { name: 'Update Task' });
        fireEvent.click(updateButton);
      });
      
      await waitFor(() => {
        expect(mockEditTask).toHaveBeenCalledWith({
          id: '1',
          title: 'Updated Task',
          description: 'Test Description 1',
          category: 'success',
          date: '2025-08-29'
        });
      });
    });
  });

  describe('Task Deletion', () => {
    test('deletes task when Delete button is clicked', async () => {
      const mockDeleteTask = jest.fn();
      useTasksStore.mockReturnValue({
        tasks: [testMockTasks[0]],
        addTask: jest.fn(),
        editTask: jest.fn(),
        deleteTask: mockDeleteTask,
        setTasks: jest.fn()
      });
      render(<App />);
      
      fireEvent.click(screen.getByText('Delete'));
      
      expect(mockDeleteTask).toHaveBeenCalledWith('1');
    });
  });

  describe('Category Filtering', () => {
    test('renders filter controls', () => {
      render(<App />);
      
      expect(screen.getAllByRole('combobox')).toHaveLength(3);
      expect(screen.getByText('Apply')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    test('shows tasks when filter is applied', () => {
      useTasksStore.mockReturnValue({
        tasks: [...testMockTasks],
        addTask: jest.fn(),
        editTask: jest.fn(),
        deleteTask: jest.fn(),
        setTasks: jest.fn()
      });
      render(<App />);
      
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });
  });

  describe('Calendar Integration', () => {
    test('renders calendar component', () => {
      render(<App />);
      
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    test('shows tasks for selected date in header', () => {
      render(<App />);
      expect(screen.getByText('Tasks for 29 Aug 2025')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('shows validation error for empty title', async () => {
      render(<App />);
      
      fireEvent.click(screen.getByText('Add Task'));
      
      const submitButtons = screen.getAllByRole('button').filter(btn => 
        btn.textContent === 'Add Task' && btn.closest('.ant-modal')
      );
      fireEvent.click(submitButtons[0] || screen.getAllByText('Add Task')[1]);
      
      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      });
    });

    test('shows validation error for empty category', async () => {
      render(<App />);
      
      fireEvent.click(screen.getByText('Add Task'));
      
      fireEvent.change(screen.getByPlaceholderText('Enter title'), { target: { value: 'Test Task' } });
      
      const submitButtons = screen.getAllByRole('button').filter(btn => 
        btn.textContent === 'Add Task' && btn.closest('.ant-modal')
      );
      fireEvent.click(submitButtons[0] || screen.getAllByText('Add Task')[1]);
      
      await waitFor(() => {
        expect(screen.getByText('Category is required')).toBeInTheDocument();
      });
    });
  });
});
