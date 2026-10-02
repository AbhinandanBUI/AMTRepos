import { Component, OnInit,signal } from '@angular/core';
import { APIResponse } from '../../../core/app-type-defination';
import { App_API_Endpoints } from '../../../core/app-api-endpoints';
import { MasterAPIService } from '../../../services/master-api.service';
import { ToastService } from '../../../services/toast.service';

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
  states = signal<DevelopmentStateRecord[]>([]);
  name = '';
  colorCode = '#087e78';
  isLoading = false;
  isSaving = false;

  constructor(private readonly api: MasterAPIService, private readonly toast: ToastService) {}

  ngOnInit(): void {
    this.loadStates();
  }

  loadStates(): void {
    this.isLoading = true;
    this.api.get(App_API_Endpoints.common.getDevelopmentStates).subscribe({
      next: (response: APIResponse) => {
        this.states.set((response.data as DevelopmentStateRecord[]).slice()
          .sort((left, right) => left.orderBy - right.orderBy));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  createState(): void {
    const name = this.name.trim();
    if (!name || !/^#[\da-f]{6}$/i.test(this.colorCode)) return;

    this.isSaving = true;
    const orderBy = this.states().reduce((max, state) => Math.max(max, state.orderBy), 0) + 1;
    this.api.post(App_API_Endpoints.common.createDevelopmentState, { name, colorCode: this.colorCode, orderBy }).subscribe({
      next: (response: APIResponse) => {
        this.states.update((currentStates: DevelopmentStateRecord[]) => {
          return [...currentStates, response.data as DevelopmentStateRecord]
            .sort((left, right) => left.orderBy - right.orderBy);
        });
        this.name = '';
        this.toast.success(`${name} was added at position ${orderBy}.`, 'Development state created');
        this.isSaving = false;
      },
      error: () => {
        this.isSaving = false;
      },
    });
  }
}
