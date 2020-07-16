import { Todo } from '../model/todo';
import { Body, Client, Delete, Get, Path, Post, Put, Query } from './rest';
import { ApiClient } from './api-client';

export class TodoApi {

  @Get('/todos/list')
  list(@Client client: ApiClient, @Query('done') done: boolean): Promise<Todo[]> {
    return null;
  }

  @Get('/todos/:id')
  todo(@Client client: ApiClient, @Path('id') id: string): Promise<Todo> {
    return null;
  }

  @Post('/todos')
  create(@Client client: ApiClient, @Body body: { name: string }): Promise<Todo> {
    return null;
  }

  @Put('/todos/:id/done')
  done(@Client client: ApiClient, @Path('id') id: string): Promise<void> {
    return null;
  }

  @Delete('/todos/:id')
  delete(@Client client: ApiClient, @Path('id') id: string): Promise<void> {
    return null;
  }

}
