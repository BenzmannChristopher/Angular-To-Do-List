import { Component, OnInit, DoCheck, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
<<<<<<< HEAD
import { Todo } from '../models/todo.model';
=======

// Enum für Prioritätsstufen
export enum Priority {
  Low = 'low',
  Medium = 'medium',
  High = 'high'
}

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  priority: Priority;
}
>>>>>>> main

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
<<<<<<< HEAD
  newTodoDueDate: string | null = null;
  newTodoHasNotification: boolean = false;
  public isBrowser: boolean;
  notificationPermissionGranted: boolean = false;
=======
  private isBrowser: boolean;
  // Prioritäten verfügbar machen
  priorities = Priority;
  newTodoPriority: Priority = Priority.Medium;
>>>>>>> main

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
<<<<<<< HEAD
        dueDate: dueDate,
        hasNotification: dueDate !== null && this.newTodoHasNotification
=======
        priority: this.newTodoPriority
>>>>>>> main
      };

      this.todos.push(todo);
      this.newTodo = '';
<<<<<<< HEAD
      this.newTodoDueDate = null;
      this.newTodoHasNotification = false;
      
      // Schedule notification if needed
      if (this.isBrowser && todo.hasNotification && todo.dueDate) {
        this.scheduleNotification(todo);
      }
    }
  }

  removeTodo(id: number) {
=======
      // Priorität standardmäßig nach dem Hinzufügen zurücksetzen
      this.newTodoPriority = Priority.Medium;
    }
  }

  changeTodoPriority(todo: Todo, priority: Priority): void {
    todo.priority = priority;
  }

  get openTodosCount(): number {
    return this.todos.filter(todo => !todo.completed).length;
  }

  removeTodo(id: number): void {
>>>>>>> main
    this.todos = this.todos.filter(todo => todo.id !== id);
  }

  toggleCompleted(id: number) {
    const todo = this.todos.find(todo => todo.id === id);
    if (todo) {
      todo.completed = !todo.completed;
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
    if (this.filter === 'all') {
      return this.todos;
    } else if (this.filter === 'active') {
      return this.todos.filter(todo => !todo.completed);
    } else {
      return this.todos.filter(todo => todo.completed);
    }
  }
  
  // For template compatibility
  getOpenTodosCount(): number {
    return this.getOpenTodos();
  }
  
  clearCompletedTodos(): void {
    this.todos = this.todos.filter(todo => !todo.completed);
  }
  
<<<<<<< HEAD
  changeFilter(filterType: string): void {
    this.filterTodos(filterType);
=======
  hasCompletedTodos(): boolean {
    return this.todos.some(t => t.completed);
>>>>>>> main
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
  
  // Hilfsmethode, um den Prioritätstext zu bekommen
  getPriorityText(priority: Priority): string {
    switch(priority) {
      case Priority.Low: return 'Niedrig';
      case Priority.Medium: return 'Mittel';
      case Priority.High: return 'Hoch';
      default: return '';
    }
  }
}
