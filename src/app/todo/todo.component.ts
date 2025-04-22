import { Component, OnInit, DoCheck, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Todo, Subtask } from '../models/todo.model';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TodoComponent implements OnInit, DoCheck {
  todos: Todo[] = [];
  newTodo: string = '';
  filter: string = 'all';
  newTodoDueDate: string | null = null;
  newTodoHasNotification: boolean = false;
  newTodoCategory: string = '';
  public isBrowser: boolean;
  notificationPermissionGranted: boolean = false;
  
  // Predefined categories that users can choose from
  availableCategories: string[] = ['Arbeit', 'Privat', 'Einkaufen', 'Finanzen', 'Gesundheit', 'Hobby'];
  categoryFilter: string | null = null;
  
  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.loadTodos();
      this.checkNotificationPermission();
    }
  }

  ngDoCheck(): void {
    if (this.isBrowser) {
      this.saveTodos();
    }
  }

  loadTodos(): void {
    if (!this.isBrowser) return;
    
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      this.todos = JSON.parse(storedTodos, (key, value) => {
        if (key === 'dueDate' && value) {
          return new Date(value);
        }
        return value;
      });
    }
  }

  saveTodos(): void {
    if (!this.isBrowser) return;
    
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }

  addTodo() {
    if (this.newTodo.trim() !== '') {
      const dueDate = this.newTodoDueDate ? new Date(this.newTodoDueDate) : null;
      
      const todo: Todo = {
        id: Date.now(),
        title: this.newTodo.trim(),
        completed: false,
        dueDate: dueDate,
        hasNotification: dueDate !== null && this.newTodoHasNotification,
        category: this.newTodoCategory || undefined,
        subtasks: []
      };

      this.todos.push(todo);
      this.newTodo = '';
      this.newTodoDueDate = null;
      this.newTodoHasNotification = false;
      this.newTodoCategory = '';
      
      // Schedule notification if needed
      if (this.isBrowser && todo.hasNotification && todo.dueDate) {
        this.scheduleNotification(todo);
      }
    }
  }

  removeTodo(id: number) {
    this.todos = this.todos.filter(todo => todo.id !== id);
  }

  toggleCompleted(id: number) {
    const todo = this.todos.find(todo => todo.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      
      // If todo has subtasks, set all subtasks to the same completion status
      if (todo.subtasks && todo.subtasks.length > 0) {
        todo.subtasks.forEach(subtask => {
          subtask.completed = todo.completed;
        });
      }
    }
  }

  requestNotificationPermission() {
    if (!this.isBrowser) return;
    
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        this.notificationPermissionGranted = permission === 'granted';
      });
    }
  }

  scheduleNotification(todo: Todo) {
    if (!this.isBrowser || !todo.dueDate || !todo.hasNotification) return;
    
    const now = new Date();
    const timeUntilDue = todo.dueDate.getTime() - now.getTime();
    
    if (timeUntilDue > 0) {
      setTimeout(() => {
        if (!todo.completed) {
          this.showNotification(todo);
        }
      }, timeUntilDue);
    }
  }

  showNotification(todo: Todo) {
    if (!this.isBrowser || !this.notificationPermissionGranted) return;
    
    if ('Notification' in window) {
      const notification = new Notification('Aufgabe fällig', {
        body: todo.title,
        icon: '/assets/notification-icon.png'
      });
      
      notification.onclick = () => {
        window.focus();
      };
    }
  }

  checkNotificationPermission() {
    if (!this.isBrowser) return;
    
    if ('Notification' in window) {
      this.notificationPermissionGranted = Notification.permission === 'granted';
    }
  }

  updateTodoDueDate(todo: Todo, dateString: string | null) {
    const previousDueDate = todo.dueDate;
    todo.dueDate = dateString ? new Date(dateString) : null;
    
    // If notification was enabled and we removed the date, disable notifications
    if (todo.hasNotification && !todo.dueDate) {
      todo.hasNotification = false;
    }
    
    // If due date changes and notifications are enabled, reschedule notification
    if (this.isBrowser && todo.hasNotification && todo.dueDate && 
        (!previousDueDate || previousDueDate.getTime() !== todo.dueDate.getTime())) {
      this.scheduleNotification(todo);
    }
  }

  toggleNotification(todo: Todo) {
    if (!todo.dueDate) return;
    
    todo.hasNotification = !todo.hasNotification;
    
    if (this.isBrowser && todo.hasNotification) {
      this.scheduleNotification(todo);
    }
  }

  formatDate(date: Date | null): string {
    if (!date) return '';
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return new Intl.DateTimeFormat('de-DE', options).format(date);
  }

  isOverdue(todo: Todo): boolean {
    if (!todo.dueDate || todo.completed) return false;
    return todo.dueDate < new Date();
  }

  getOpenTodos(): number {
    return this.todos.filter(todo => !todo.completed).length;
  }

  filterTodos(filterType: string) {
    this.filter = filterType;
  }

  getFilteredTodos(): Todo[] {
    let filtered = this.todos;

    // Apply completed/active filter
    if (this.filter === 'active') {
      filtered = filtered.filter(todo => !todo.completed);
    } else if (this.filter === 'done') {
      filtered = filtered.filter(todo => todo.completed);
    }

    // Apply category filter if set
    if (this.categoryFilter) {
      filtered = filtered.filter(todo => todo.category === this.categoryFilter);
    }

    return filtered;
  }
  
  // For template compatibility
  getOpenTodosCount(): number {
    return this.getOpenTodos();
  }
  
  clearCompletedTodos(): void {
    this.todos = this.todos.filter(todo => !todo.completed);
  }
  
  changeFilter(filterType: string): void {
    this.filterTodos(filterType);
  }
  
  filteredTodos(): Todo[] {
    return this.getFilteredTodos();
  }
  
  updateDueDate(todo: Todo): void {
    // This is needed because we're using two-way binding in the template
    if (todo.dueDate instanceof Date) {
      const dateString = todo.dueDate.toISOString().slice(0, 16);
      this.updateTodoDueDate(todo, dateString);
    } else {
      this.updateTodoDueDate(todo, null);
    }
  }

  // Update todo category from dropdown selection
  updateTodoCategory(todo: Todo, event: Event): void {
    const select = event.target as HTMLSelectElement;
    todo.category = select.value || undefined;
  }
  
  // Set category for new todo
  setCategory(category: string): void {
    this.newTodoCategory = category;
  }

  // Check if a category is selected for new todo
  isCategorySelected(category: string): boolean {
    return this.newTodoCategory === category;
  }

  // Check if a todo has a specific category
  hasTodoCategory(todo: Todo, category: string): boolean {
    return todo.category === category;
  }

  // Filter todos by category
  filterByCategory(category: string | null): void {
    this.categoryFilter = category;
  }

  // Get todos by category for drag-drop lists
  getTodosByCategory(category: string | null): Todo[] {
    if (category === null) {
      // For "uncategorized" list
      return this.todos.filter(todo => !todo.category);
    } else {
      return this.todos.filter(todo => todo.category === category);
    }
  }

  // Get todos by priority for drag-drop lists
  getTodosByPriority(priority: 'high' | 'medium' | 'low' | null): Todo[] {
    if (priority === null) {
      // For todos without priority
      return this.todos.filter(todo => !todo.priority);
    } else {
      return this.todos.filter(todo => todo.priority === priority);
    }
  }

  // Subtask methods
  addSubtask(todo: Todo, subtaskText: string) {
    if (subtaskText.trim() !== '') {
      if (!todo.subtasks) {
        todo.subtasks = [];
      }
      
      const subtask: Subtask = {
        id: Date.now(),
        title: subtaskText.trim(),
        completed: false
      };
      
      todo.subtasks.push(subtask);
    }
  }
  
  removeSubtask(todo: Todo, subtaskId: number) {
    if (todo.subtasks) {
      todo.subtasks = todo.subtasks.filter(subtask => subtask.id !== subtaskId);
    }
  }
  
  toggleSubtaskCompleted(todo: Todo, subtaskId: number) {
    if (todo.subtasks) {
      const subtask = todo.subtasks.find(subtask => subtask.id === subtaskId);
      if (subtask) {
        subtask.completed = !subtask.completed;
        
        // Check if all subtasks are completed and update the main task status if needed
        this.updateTaskCompletionStatus(todo);
      }
    }
  }
  
  updateTaskCompletionStatus(todo: Todo) {
    if (todo.subtasks && todo.subtasks.length > 0) {
      // Set task as completed only if all subtasks are completed
      todo.completed = todo.subtasks.every(subtask => subtask.completed);
    }
  }
  
  getCompletedSubtasksCount(todo: Todo): number {
    if (!todo.subtasks || todo.subtasks.length === 0) {
      return 0;
    }
    return todo.subtasks.filter(subtask => subtask.completed).length;
  }
  
  getSubtasksProgress(todo: Todo): number {
    if (!todo.subtasks || todo.subtasks.length === 0) {
      return 0;
    }
    return Math.round((this.getCompletedSubtasksCount(todo) / todo.subtasks.length) * 100);
  }
}

