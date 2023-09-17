import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Cambiado a FormBuilder y FormGroup; // Asegúrate de reemplazar 'ruta-al-componente-de-blockui' con la ruta correcta
import { LoadingService } from 'app/auth/service/loading.service';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { CoreConfigService } from '@core/services/config.service';
import { ApiService } from '@core/services/api.service';
import { environment } from 'environments/environment';
import { HttpClient } from '@angular/common/http';
import { IndividualConfig, ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'app/auth/service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-register-v2',
  templateUrl: './auth-register-v2.component.html',
  styleUrls: ['./auth-register-v2.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AuthRegisterV2Component implements OnInit {
  // Public
  public coreConfig: any;
  public passwordTextType: boolean;
  public registerForm: FormGroup; // Cambiado a FormGroup
  public submitted = false;
  public termsAccepted: boolean = false;
  // Private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   * @param {FormBuilder} _formBuilder
   */
  constructor(
    private _coreConfigService: CoreConfigService,
    private _formBuilder: FormBuilder,  
    public ApiService: ApiService,
    private _toastrService: ToastrService,
    private _authenticationService: AuthenticationService,
    private loadingService: LoadingService,
    private _router: Router
    ) {
    this._unsubscribeAll = new Subject();

    // Configure the layout
    this._coreConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        menu: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        customizer: false,
        enableLocalStorage: false
      }
    };
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.registerForm.controls;
  }

  /**
   * Toggle password
   */
  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }

  /**
   * On Submit
   */
 

  onSubmit() {
    this.submitted = true;
    console.log('Botón de registro clicado');
    console.log('Formulario válido:', this.registerForm.valid);
  
    if (this.registerForm.valid) {
      const phoneNumber = this.registerForm.get('telefono').value;
      const password = this.registerForm.get('clave').value;
  // Mostrar el servicio de carga
  this.loadingService.showLoading();
      this.ApiService.registerUser(phoneNumber, password).subscribe(
        response => {
          console.log('Registro exitoso', response);
  
          // Mostrar un toast para informar al usuario que el registro fue exitoso
          this._toastrService.success('Registro exitoso', 'Éxito en el registro', {
            toastClass: 'toast ngx-toastr',
      closeButton: true,
      positionClass: 'toast-top-center',
      progressBar: true,
      timeOut: 8000,
      extendedTimeOut: 0,
      tapToDismiss: true,
      disableTimeOut: false,
      onActivateTick: true,
          });
  
          // Retrasa el inicio de sesión automático para dar tiempo a mostrar el toast
          setTimeout(() => {
            this.loginAutomatically(phoneNumber, password);
          }, 1000); 
          
          // 1000 milisegundos (1 segundo), ajusta según tu necesidad
        },
        error => {
          console.error('Error en el registro:', error.error);
        
          // Mostrar el mensaje de error del API en el toast
          this._toastrService.error(error.error, 'Error en el registro', {
            toastClass: 'toast ngx-toastr',
            closeButton: true,
            positionClass: 'toast-top-center',
            progressBar: true,
            timeOut: 8000,
            extendedTimeOut: 0,
            tapToDismiss: true,
            disableTimeOut: false,
            onActivateTick: true,
          });
        }
      );
    }
  }
  
  loginAutomatically(phoneNumber: string, password: string) {
    // Llama al método de inicio de sesión con los datos del registro
    this._authenticationService.loginCulture(phoneNumber, password).subscribe(
      response => {
        console.log('Inicio de sesión automático exitoso', response);
  // Ocultar el servicio de carga después de que el inicio de sesión sea exitoso
  this.loadingService.hideLoading();
        // Mostrar un toast para informar al usuario que se está redirigiendo
        this._toastrService.info('Redireccionando a la página principal', 'Inicio de sesión automático', {
          toastClass: 'toast ngx-toastr',
      closeButton: true,
      positionClass: 'toast-bottom-center',
      progressBar: true,
      timeOut: 8000,
      extendedTimeOut: 0,
      tapToDismiss: true,
      disableTimeOut: false,
      onActivateTick: true,
        });
  
        // Redirigir al usuario a la raíz después de que el toast termine
        setTimeout(() => {
          this._router.navigate(['/']); // Cambia '/raiz' a la ruta de la raíz de tu aplicación
        }, 2000); // 2000 milisegundos (2 segundos), ajusta según tu configuración de tiempo de espera
      },
      error => {
        console.error('Error en el inicio de sesión automático:', error);
        // Manejar errores del inicio de sesión automático si es necesario
      }
    );
  }

 
  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.registerForm = this._formBuilder.group({
      clave: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]], // Cambiado de 'password' a 'clave'
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]], // Cambiado de 'phoneNumber' a 'telefono'
      aceptarTerminos: [false, [Validators.requiredTrue]] // Cambiado a Validators.requiredTrue para la casilla de verificación
    });

    // Subscribe to config changes
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
    });
    
  }

  
  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
