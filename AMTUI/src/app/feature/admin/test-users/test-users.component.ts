import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MasterAPIService } from '../../../services/master-api.service';
import { APIResponse } from '../../../core/app-type-defination';
import { App_API_Endpoints } from '../../../core/app-api-endpoints';

interface TestUserForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

interface CreatedTestUser {
  _id: string;
  fullName: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-test-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-users.component.html',
  styleUrl: './test-users.component.css',
})
export class TestUsersComponent {
  readonly roles = [
    { value: 'Admin', label: 'Admin' },
    { value: 'ScrumMaster', label: 'Scrum Master' },
    { value: 'ProductOwner', label: 'Product Owner' },
    { value: 'Developer', label: 'Developer' },
  ];
  readonly users: CreatedTestUser[] = [];
  readonly form: TestUserForm = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Developer',
  };
  errorMessage = '';
  successMessage = '';
  isSaving = false;

  constructor(private readonly api: MasterAPIService) {}

  createTestUser(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.isSaving = true;

    this.api.post(App_API_Endpoints.users.createTestUser, this.form).subscribe({
      next: (response: APIResponse) => {
        const user = response.data.user as CreatedTestUser;
        this.users.unshift(user);
        this.successMessage = `${user.fullName} was created.`;
        this.form.firstName = '';
        this.form.lastName = '';
        this.form.email = '';
        this.form.password = '';
        this.form.role = 'Developer';
        this.isSaving = false;
      },
      error: (error: { error?: { message?: string } }) => {
        this.errorMessage = error.error?.message || 'The test user could not be created.';
        this.isSaving = false;
      },
    });
  }
}