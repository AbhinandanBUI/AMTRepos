import { Component, ElementRef, HostListener, ViewChild, OnDestroy, inject } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { APP_User_Data, New_Work_Items } from '../../../core/app-constant-data';
import { ToastService } from '../../../services/toast.service';

@Component({
    standalone: false,
    selector: 'app-work-item-create',
    templateUrl: './work-item-create.component.html',
    styleUrls: ['./work-item-create.component.css']
})
export class WorkItemCreateComponent {
}
