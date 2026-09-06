
import { Component } from '@angular/core';
import { LabelComponent } from '../../form/label/label.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MasterAPIService } from '../../../../services/master-api.service';
import { App_API_Endpoints } from '../../../../core/app-api-endpoints';


@Component({
  selector: 'app-signup-form',
  imports: [
    LabelComponent,
    CheckboxComponent,
    InputFieldComponent,
    RouterModule,
    FormsModule
  ],
  templateUrl: './signup-form.component.html',
  styles: ``
})
export class SignupFormComponent {


  showPassword = false;
  isChecked = false;

  fname = '';
  lname = '';
  email = '';
  password = '';


  constructor(private _api: MasterAPIService) {
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignIn() {
    console.log('First Name:', this.fname);
    console.log('Last Name:', this.lname);
    console.log('Email:', this.email);
    console.log('Password:', this.password);
    console.log('Remember Me:', this.isChecked);

    const requestBody = {
      email: this.email,
      firstName: this.fname,
      lastName: this.lname,
      password: this.password  
    }

    this._api.post(App_API_Endpoints.users.registerUser, requestBody).subscribe({
      next: (response) => { console.log(response) },
      error: (error) => { console.log(error) }
    })

  }
}
