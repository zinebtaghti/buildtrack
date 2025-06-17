import React, { createContext, useContext } from 'react';
import { useTasks, Task, TaskComment } from '@/hooks/useTasks';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  createTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<Task>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addComment: (taskId: string, text: string) => Promise<TaskComment>;
  updateComment: (taskId: string, commentId: string, text: string) => Promise<void>;
  deleteComment: (taskId: string, commentId: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode; projectId?: string }> = ({ 
  children,
  projectId 
}) => {
  const taskData = useTasks(projectId);

  return (
    <TaskContext.Provider value={taskData}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}; 