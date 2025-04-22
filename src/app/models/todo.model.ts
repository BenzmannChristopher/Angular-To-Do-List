export interface Todo {
    id: number;
    title: string;
    completed: boolean;
<<<<<<< HEAD
    dueDate: Date | null;
    hasNotification: boolean;
=======
    priority: 'high' | 'medium' | 'low';
>>>>>>> main
  }