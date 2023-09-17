import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
 
import { environment } from 'environments/environment';
import { User, Role } from 'app/auth/models';
import { IndividualConfig, ToastrService } from 'ngx-toastr';
import { ApiService } from '@core/services/api.service'; 

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  //public
  public currentUser: Observable<User>;

  //private
  private currentUserSubject: BehaviorSubject<User>;

  /**
   *
   * @param {HttpClient} _http
   * @param {ToastrService} _toastrService
   */
  constructor(private _http: HttpClient, private _toastrService: ToastrService,  private apiService: ApiService) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // getter: currentUserValue
  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  /**
   *  Confirms if user is admin
   */
  get isAdmin() {
    return this.currentUser && this.currentUserSubject.value.role === Role.Admin;
  }

  /**
   *  Confirms if user is client
   */
  get isClient() {
    return this.currentUser && this.currentUserSubject.value.role === Role.Client;
  }

  /**
   * User login
   *
   * @param email
   * @param password
   * @returns user
   */

  

  loginCulture(phoneNumber: string, password: string) {
    // Display cookie and privacy policy toast
    this._toastrService.info('Al continuar, aceptas nuestras políticas y uso de cookies.', 'Aviso de privacidad y cookies', {
      toastClass: 'toast ngx-toastr',
      closeButton: true,
      positionClass: 'toast-bottom-left',
      progressBar: true,
      timeOut: 8000,
      extendedTimeOut: 0,
      tapToDismiss: true,
      disableTimeOut: false,
      onActivateTick: true,
    });
  
    return this._http
      .post<any>(`${environment.apiUrl}/login`, { phoneNumber, password })
      .pipe(
        switchMap(user => {
          // login successful if there's a jwt token in the response
          if (user && user.token) {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('currentUser', JSON.stringify(user));
            console.log(user.idUser); // Cambiar user.id a user.idUser
  
            // Ensure user.idUser is defined
            if (user.idUser !== undefined) { // Cambiar user.id a user.idUser
              // Fetch user details from API and log them
              return this.apiService.getUserById(user.idUser).pipe( // Cambiar user.id a user.idUser
                tap(userDetails => {
                  console.log('Nombre de usuario:', userDetails.Profile.username);
                  console.log('Rol:', userDetails.role);

                  if (userDetails) {
                    // Selecciona las propiedades que deseas almacenar
                    const userToStore = {
                       id: userDetails.id,
                      // phoneNumber: userDetails.phoneNumber,
                      // verified: userDetails.verified,
                      // member: userDetails.member,
                      lastLogin: userDetails.lastLogin,
                      role: userDetails.role,
                      username: userDetails.Profile.username,
                       name: userDetails.Profile.name
                    };
                     // Almacena la información seleccionada en el localStorage
                    localStorage.setItem('currentUser', JSON.stringify(userToStore));
                  }
                }),
                map(() => user) // Pasar el usuario original a través del observable
              );
            }
          }
  
          return of(user); // Devolver el usuario original si no se encontró un token
        }),
        tap(user => {
          // Display welcome toast!
          setTimeout(() => {
            this.apiService.getUserById(user.idUser).subscribe(userDetails => {
              if (userDetails && userDetails.Profile && userDetails.Profile.username) {
                const username = userDetails.Profile.username;
                this._toastrService.success(
                  'Ha iniciado sesión correctamente como ' + userDetails.role +
                  ' usuario de Culture. Ahora puedes empezar a explorar. ¡Disfrutar! 🎉',
                  '👋 Bienvenido, ' + username + '!',
                  { toastClass: 'toast ngx-toastr', closeButton: true }
                );
              } else {
                this._toastrService.info(
                  'Ha iniciado sesión correctamente. ¡Por favor, configura tu perfil!',
                  '👋 Bienvenido!',
                  { toastClass: 'toast ngx-toastr', closeButton: true }
                );
              }
            });
          }, 2500);
          
          
  
          // notify
          this.currentUserSubject.next(user);
        })
      );
  }
  
  /**
   * User expiresIN
   *
   */
  
  checkTokenExpiration(): boolean {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      const expirationDate = userData.expirationDate;
      if (expirationDate && expirationDate <= new Date().getTime()) {
        // El token ha expirado
        return true;
      }
    }
    return false;
  }

  /**
   * User logout
   *
   */
  logout() {
    // Display goodbye toast!
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Bogota',
      hour12: true,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    });
    const formattedTime = formatter.format(now);
    const toastrOptions: Partial<IndividualConfig> = {
      toastClass: 'toast ngx-toastr',
      closeButton: true,
      enableHtml: true,
      positionClass: 'toast-top-center',
      progressBar: true,
      timeOut: 8000,
      extendedTimeOut: 0,
      tapToDismiss: false,
      disableTimeOut: false,
      onActivateTick: true,
    };
    this._toastrService.info(
      `<span>Sesión cerrada de forma segura.</span><br/><small>Solicitud realizada a las ${formattedTime}</small>`,
      '¡Adiós!',
      toastrOptions
    );
  
    // remove all items from local storage to log user out
    localStorage.clear();
    // remove all cookies
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;';
    }
    // notify
    this.currentUserSubject.next(null);
  }
  
  
}
