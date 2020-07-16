import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { TodoApi } from './api/todo-api';
import { ApiClient } from './api/api-client';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [
    {
      provide: ApiClient,
      useClass: ApiClient,
      deps: [HttpClient]
    },
    {
      provide: TodoApi,
      useClass: TodoApi
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
