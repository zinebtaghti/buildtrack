// Project type definition
export interface Project {
  id: string;
  name: string;
  description?: string;
  client: string;
  location: string;
  startDate: string;
  endDate?: string;
  timeline?: {
    start: {
      seconds: number;
      nanoseconds: number;
    };
    end: {
      seconds: number;
      nanoseconds: number;
    };
  };
  budget: number;
  status: 'active' | 'completed' | 'on-hold';
  progress?: number;
  team: string[];
  tasks?: Task[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Team member type definition
export interface Member {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar?: string;
  projects?: string[];
}

// Task type definition
export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  voiceNote?: {
    url: string;
    duration: number;
  };
}

// Document type definition
export interface Document {
  id: string;
  name: string;
  type: string; // 'blueprint', 'image', 'spreadsheet', 'document', etc.
  fileUri: string;
  size: string;
  date: string;
  project?: string;
}

// Task type definition
export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string | Date;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  assignedTo?: string[];
  projectId: string;
  createdBy: string;
  createdAt: string;
  voiceNote?: {
    url: string;
    duration: number;
  };
}

// Progress update type definition
export interface ProgressUpdate {
  id: string;
  projectId: string;
  description: string;
  progress: number;
  images?: string[];
  audioNotes?: string[];
  createdBy: string;
  createdAt: string;
}

// Budget item type definition
export interface BudgetItem {
  id: string;
  projectId: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  type: 'expense' | 'income';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdBy: string;
  createdAt: string;
}