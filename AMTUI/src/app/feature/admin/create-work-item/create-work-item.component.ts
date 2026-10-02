import { Component, OnInit,signal } from '@angular/core';
import { MasterAPIService } from '../../../services/master-api.service';
import { APIResponse, Work_Item_Type } from '../../../core/app-type-defination';
import { App_API_Endpoints } from '../../../core/app-api-endpoints';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-create-work-item',
  standalone: false,
  styleUrl: './create-work-item.component.css',
  templateUrl: './create-work-item.component.html',
})
export class CreateWorkItemComponent implements OnInit {
  workItemLists= signal<Work_Item_Type[]>([]);
  name = '';
  colorCode = '#087e78';
  isLoading = false;
  isSaving = false;

  constructor(private readonly api: MasterAPIService, private readonly toast: ToastService) {}

  ngOnInit(): void {
    this.loadWorkItems();
  }

  loadWorkItems(): void {
    this.isLoading = true;
    this.api.get(App_API_Endpoints.common.getWorkItems).subscribe({
      next: (response: APIResponse) => {
        this.workItemLists.set(response.data as Work_Item_Type[]);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  createWorkItem(): void {
    const name = this.name.trim();
    if (!name || !/^#[\da-f]{6}$/i.test(this.colorCode)) return;

    this.isSaving = true;
    this.api.post(App_API_Endpoints.common.createWorkItem, { name, colorCode: this.colorCode }).subscribe({
      next: (response: APIResponse) => {
        this.workItemLists.update((workItems: Work_Item_Type[]) => {
          const updatedWorkItems = [...workItems, response.data as Work_Item_Type];
          return updatedWorkItems.sort((left, right) => left.name.localeCompare(right.name));
        });
        this.name = '';
        this.toast.success(`${name} was added.`, 'Work item type created');
        this.isSaving = false;
      },
      error: () => {
        this.isSaving = false;
      },
    });
  }
}
