import { Component, OnInit, DoCheck, PLATFORM_ID, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';

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

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class TodoComponent implements OnInit, DoCheck {
  todos: Todo[] = [];
  newTodo: string = '';
  filter: string = 'all';
  private isBrowser: boolean;
  // Prioritäten verfügbar machen
  priorities = Priority;
  newTodoPriority: Priority = Priority.Medium;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      const saved = localStorage.getItem('todos');
      if (saved) {
        this.todos = JSON.parse(saved);
      }
    }
  }

  ngDoCheck(): void {
    if (this.isBrowser) {
      localStorage.setItem('todos', JSON.stringify(this.todos));
    }
  }

  addTodo() {
    if (this.newTodo.trim() !== '') {
      const newTask: Todo = {
        id: Date.now(),
        title: this.newTodo.trim(),
        completed: false,
        priority: this.newTodoPriority
      };

      this.todos.push(newTask);
      this.newTodo = '';
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
    this.todos = this.todos.filter(todo => todo.id !== id);
  }

  toggleTodoCompletion(todo: Todo): void {
    todo.completed = !todo.completed;
  }

  clearCompletedTodos(): void {
    this.todos = this.todos.filter(todo => !todo.completed);
  }
  
  hasCompletedTodos(): boolean {
    return this.todos.some(t => t.completed);
  }
  
  filteredTodos(): Todo[] {
    if (this.filter === 'open') return this.todos.filter(t => !t.completed);
    if (this.filter === 'done') return this.todos.filter(t => t.completed);
    return this.todos;
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
