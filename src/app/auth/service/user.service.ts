import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'environments/environment';
import { User, UserCulture } from 'app/auth/models';

@Injectable({ providedIn: 'root' })
export class UserService {
  /**
   *
   * @param {HttpClient} _http
   */
  constructor(private _http: HttpClient) {}

  /**
   * Get all users
   */
  getAll() {
    return this._http.get<User[]>(`${environment.apiUrl}/usuarios`);
  }

  /**
   * Get user by id
   */
  getById(id: number) {
    return this._http.get<User>(`${environment.apiUrl}/usuario/${id}`);
  }

  
   /**
   * Get all users
   */
   getAllUserCulture() {
    return this._http.get<UserCulture[]>(`${environment.apiUrl}/usuarios`);
  }

  /**
   * Get user by id
   */
  getByIdUserCulture(id: number) {
    return this._http.get<UserCulture>(`${environment.apiUrl}/usuario/${id}`);
  }
}
