import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root' 
})
export class ApiService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient,  private router: Router) { }


  // Método para realizar una solicitud GET con control de errores
  get(endpoint: string): Observable<any> {
    return this.http.get(`${this.apiUrl}${endpoint}`)
      .pipe(
        catchError(this.handleError)
      );
  }
 // Agrega este método para consultar un usuario por su ID
 getUserById(userId: number): Observable<any> {
  return this.http.get(`${this.apiUrl}/usuario/${userId}`);
}
  // Método para realizar una solicitud POST para el login
  login(phoneNumber: string, securityCode: string): Observable<any> {
    const data = {
      phoneNumber: phoneNumber,
      securityCode: securityCode
    };
    return this.http.post(`${this.apiUrl}login`, data)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para realizar una solicitud POST para el registro
  registerUser(phoneNumber: string, password: string) {
    const body = {
      phoneNumber: phoneNumber,
      password: password
    };
    return this.http.post(`${environment.apiUrl}/registro`, body);
  }
  

  // Método para realizar una solicitud PUT con control de errores
  put(endpoint: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}${endpoint}`, data)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para realizar una solicitud DELETE con control de errores
  delete(endpoint: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}${endpoint}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Manejo de errores
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código de error: ${error.status}, Mensaje: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(errorMessage);
  }
}
