import { Component } from '@angular/core';
import { TodoApi } from './api/todo-api';
import { ApiClient } from './api/api-client';
import { Todo } from './model/todo';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(
    private apiClient: ApiClient,
    private todoApi: TodoApi
  ) {
  }

  title = 'ApiClient';
  todo: Todo = null;

  onClick(): void {
    this.todoApi.create(this.apiClient, {name: 'Example Todo'})
      .then(todo => {
        this.todo = todo;
      });
  }
}
