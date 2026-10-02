import { Component, OnInit } from '@angular/core';
import { APIResponse } from '../../../core/app-type-defination';
import { App_API_Endpoints } from '../../../core/app-api-endpoints';
import { MasterAPIService } from '../../../services/master-api.service';

interface DevelopmentStateRecord {
  _id: string;
  developmentStateId: number;
  name: string;
  colorCode: string;
  orderBy: number;
}

@Component({
  selector: 'app-create-development-state',
  standalone: false,
  styleUrl: './create-development-state.component.css',
  templateUrl: './create-development-state.component.html',
})
export class CreateDevelopmentStateComponent implements OnInit {
  states: DevelopmentStateRecord[] = [];
  name = '';
  colorCode = '#087e78';
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  isSaving = false;

  constructor(private readonly api: MasterAPIService) {}

  ngOnInit(): void {
    this.loadStates();
  }

  loadStates(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.api.get(App_API_Endpoints.common.getDevelopmentStates).subscribe({
      next: (response: APIResponse) => {
        this.states = (response.data as DevelopmentStateRecord[]).slice()
          .sort((left, right) => left.orderBy - right.orderBy);
        this.isLoading = false;
      },
      error: (error: { error?: { message?: string } }) => {
        this.errorMessage = error.error?.message || 'Could not load development states.';
        this.isLoading = false;
      },
    });
  }

  createState(): void {
    const name = this.name.trim();
    if (!name || !/^#[\da-f]{6}$/i.test(this.colorCode)) return;

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';
    const orderBy = this.states.reduce((max, state) => Math.max(max, state.orderBy), 0) + 1;
    this.api.post(App_API_Endpoints.common.createDevelopmentState, { name, colorCode: this.colorCode, orderBy }).subscribe({
      next: (response: APIResponse) => {
        this.states = [...this.states, response.data as DevelopmentStateRecord]
          .sort((left, right) => left.orderBy - right.orderBy);
        this.name = '';
        this.successMessage = `${name} was added at position ${orderBy}.`;
        this.isSaving = false;
      },
      error: (error: { error?: { message?: string } }) => {
        this.errorMessage = error.error?.message || 'Could not create the development state.';
        this.isSaving = false;
      },
    });
  }
}
