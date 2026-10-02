import { Service } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Work_Item_Type } from '../../core/app-type-defination';

@Service()
export class DataBroadCastChannelService {
    private developmentStatesSubject = new BehaviorSubject<any[]>([]);
    developmentStates$ = this.developmentStatesSubject.asObservable();

    private workItemsSubject = new BehaviorSubject<Work_Item_Type[]>([]);
    workItems$ = this.workItemsSubject.asObservable();


    setDevelopmentStates(data: any[]) {
        this.developmentStatesSubject.next(data);
    }

    setWorkItems(data: Work_Item_Type[]) {
        this.workItemsSubject.next(data);
    }
}
