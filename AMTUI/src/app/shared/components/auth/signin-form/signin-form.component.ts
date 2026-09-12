
import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
// import { LabelComponent } from '../../form/label/label.component';
// import { CheckboxComponent } from '../../form/input/checkbox.component';
// import { ButtonComponent } from '../../ui/button/button.component';
// import { InputFieldComponent } from '../../form/input/input-field.component';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MasterAPIService } from '../../../../services/master-api.service';
import { App_API_Endpoints } from '../../../../core/app-api-endpoints';
import { LocalStorageService } from '../../../../services/StorageServices/local-storage.service';
import { UserProfile } from '../../../../core/app-type-defination';
declare const google: any;

@Component({
  selector: 'app-signin-form',
  imports: [
    // LabelComponent,
    // CheckboxComponent,
    // ButtonComponent,
    // InputFieldComponent,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './signin-form.component.html',
  styles: ``
})

export class SigninFormComponent implements OnInit {

  isChecked = false;
  showPassword = false;
  loginForm: FormGroup = [] as unknown as FormGroup;
  clientId: string = '';

  constructor(private fb: FormBuilder, private _router: Router, private _api: MasterAPIService,
    private _localStorage: LocalStorageService,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {

    this.loadForm();
  }

  loadForm() {
    this.loginForm = this.fb.group({
      email: [''],
      password: [''],
      rememberMe: [false]
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  onSignIn() {
    console.log('login form value', this.loginForm.value);


  }
  ngAfterViewInit(): void {
    this.getClientId()

  }


  getClientId(): void {

    this._api.get(App_API_Endpoints.common.getGoogle).subscribe({
      next: (result) => {
        if (result.success) {
          this.clientId = result.data;
          google.accounts.id.initialize({
            client_id: this.clientId,

            callback: (response: any) => {

              this.ngZone.run(() => {
                debugger;
                const body = {
                  credential: response.credential
                }
                this._api
                  .googleLogin(App_API_Endpoints.users.googleLogin, body)
                  .subscribe({
                    next: (result) => {
                      if (result.success && result.statusCode === 200) {
                        this._localStorage.clear();
                        this._localStorage.setToken(result.data.accessToken);
                        let usr = result.data.user;
                        const user = {
                          email: usr.email,
                          name: usr.fullName,
                          profileUrl: usr.avatar.url,
                          id: usr._id
                        } as UserProfile;
                        this._localStorage.setUser(user);
                        this._router.navigateByUrl('/timesheet/overview');

                      } else {
                        this._localStorage.clear();
                      }

                    },

                    error: (error) => {
                      console.error(
                        'Login failed',
                        error
                      );
                    }
                  });

              });

            }
          });

          google.accounts.id.renderButton(
            document.getElementById('googleButton'),
            {
              theme: 'filled_blue',
              size: 'large',
              width: 70
            }
          );
        }
      },
      error(err) {
        console.log(err);

      },
    });

  }
}
