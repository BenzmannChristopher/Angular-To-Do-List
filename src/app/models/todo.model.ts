export interface Todo {
    id: number;
    title: string;
    completed: boolean;
    dueDate: Date | null;
    hasNotification: boolean;
    priority?: 'high' | 'medium' | 'low';
    category?: string;
    subtasks?: Subtask[];
}

export interface Subtask {
    id: number;
    title: string;
    completed: boolean;
}