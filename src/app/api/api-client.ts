import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

const baseUrl = environment.apiUrl;

export class ApiClient {

  constructor(
    private httpClient: HttpClient
  ) {
  }

  private headers(): HttpHeaders {
    // Firebase Authなどを使っている場合はここでトークンを取得して設定する等も出来る。
    const token = 'set token if you need it.';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  get<T>(url: string, queryStrings: HttpParams): Promise<T> {
    return this.httpClient.get<T>(`${baseUrl}${url}`, {
      headers: this.headers(),
      params: queryStrings
    }).toPromise();
  }

  post<T>(url: string, body: any): Promise<T> {
    const options = {
      headers: this.headers().append('Content-Type', 'application/json')
    };
    return this.httpClient.post<T>(`${baseUrl}${url}`, body, options).toPromise();
  }

  put<T>(url: string, body: any): Promise<T> {
    const options = {
      headers: this.headers().append('Content-Type', 'application/json')
    };
    return this.httpClient.put<T>(`${baseUrl}${url}`, body, options).toPromise();
  }

  delete<T>(url: string): Promise<T> {
    return this.httpClient.delete<T>(`${baseUrl}${url}`, {headers: this.headers()}).toPromise();
  }

}

