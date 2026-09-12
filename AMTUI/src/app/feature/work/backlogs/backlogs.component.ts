import { Component } from '@angular/core';
import { New_Work_Items, APP_User_Data } from '../../../core/app-constant-data';
import { MasterAPIService } from '../../../services/master-api.service';
import { App_API_Endpoints } from '../../../core/app-api-endpoints';


@Component({
  standalone: false,
  selector: 'app-backlogs',
  styleUrl: './backlogs.component.css',
  templateUrl: './backlogs.component.html',
})
export class BacklogsComponent {
  workItemTypes = (New_Work_Items || []).slice();
  users = (APP_User_Data || []).slice();
  selectedType: any = null;
  items: any[] = [];
  filter: any = { q: '', assignee: '', state: '', minSP: null, maxSP: null };
  // color palette for avatars
  // consistent avatar palette and state colors (shared mapping)
  private avatarPalette = ['#2563eb', '#0ea5e9', '#f97316', '#10b981', '#7c3aed', '#ef4444', '#06b6d4', '#f59e0b', '#a78bfa', '#7dd3fc'];
  private stateColorMap: Record<string, string> = {
    'New': '#0ea5e9', 'Active': '#f59e0b', 'In Progress': '#f97316', 'Resolved': '#10b981', 'Closed': '#6b7280', 'Blocked': '#ef4444'
  };

  constructor(private _api: MasterAPIService) {
    if (this.workItemTypes.length) this.selectType(this.workItemTypes[0]);
  }

  selectType(t: any) {
    this.selectedType = t;
    this.items = this.generateSampleItemsFor(t, 6);
  }

  get filteredItems() {
    let list = (this.items || []).slice();
    const f = this.filter || {};
    if (f.q) {
      const q = String(f.q).toLowerCase();
      list = list.filter(i => (i.title || '').toLowerCase().includes(q));
    }
    if (f.assignee) {
      list = list.filter(i => i.assignee === f.assignee);
    }
    if (f.state) {
      list = list.filter(i => i.state === f.state);
    }
    if (f.minSP != null && f.minSP !== '') {
      const mn = Number(f.minSP);
      if (!isNaN(mn)) list = list.filter(i => Number(i.storyPoint) >= mn);
    }
    if (f.maxSP != null && f.maxSP !== '') {
      const mx = Number(f.maxSP);
      if (!isNaN(mx)) list = list.filter(i => Number(i.storyPoint) <= mx);
    }
    return list;
  }

  get availableStates() {
    return Array.from(new Set((this.items || []).map(i => i.state))).filter(Boolean);
  }

  generateSampleItemsFor(type: any, count = 5) {
    const arr: any[] = [];
    for (let i = 1; i <= count; i++) {
      const rndUser = this.users[i % this.users.length] || { Name: 'Unassigned' };
      arr.push({
        id: `${type.Name}-${i}`,
        title: `${type.Name} ${i}: Example backlog item for ${type.Name}`,
        state: i % 3 === 0 ? 'In Progress' : (i % 5 === 0 ? 'Resolved' : 'New'),
        assignee: rndUser.Name,
        storyPoint: (i % 5) + 1
      });
    }
    return arr;
  }

  getStateColor(state: string) {
    if (!state) return '#94a3b8';
    return this.stateColorMap[state] || '#94a3b8';
  }

  getAssigneeColor(name: string) {
    if (!name) return '#cbd5e1';
    let s = 0; for (let i = 0; i < name.length; i++) s = (s * 31 + name.charCodeAt(i)) >>> 0;
    return this.avatarPalette[s % this.avatarPalette.length];
  }

  getInitials(name: string) {
    if (!name) return '';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }

  // Work item type colors (classic mapping)
  private typeColorMap: Record<string, string> = {
    'Bug': '#ef4444',
    'ChangeRequest': '#f97316',
    'Epic': '#8b5cf6',
    'Feature': '#3b82f6',
    'Issue': '#fb7185',
    'Observation': '#f59e0b',
    'Risk': '#f43f5e',
    'Subtask': '#06b6d4',
    'Task': '#10b981',
    'Test': '#6366f1',
    'TestCase': '#7c3aed',
    'UserStory': '#0ea5a4'
  };

  getTypeColor(typeName: string) {
    return this.typeColorMap[typeName] || '#94a3b8';
  }

  // dropdown open state for custom selects
  assigneeOpen = false;
  stateOpen = false;

  toggleAssignee() { this.assigneeOpen = !this.assigneeOpen; this.stateOpen = false; }
  toggleState() { this.stateOpen = !this.stateOpen; this.assigneeOpen = false; }
  closeDropdowns() { this.assigneeOpen = false; this.stateOpen = false; }
  selectAssignee(name: string) { this.filter.assignee = name; this.assigneeOpen = false; }
  selectState(s: string) { this.filter.state = s; this.stateOpen = false; }

  saveData() {
    this._api.post(App_API_Endpoints.common.saveWorkItem, {}).subscribe({
      next(value) {
        console.log('success', value);
      },
      error(err) {
        console.log('err', err);
      },
    });
    this._api.post(App_API_Endpoints.common.saveDevelopmentState, {}).subscribe({
      next(value) {
        console.log('success', value);
      },
      error(err) {
        console.log('err', err);
      },
    });
  }
  getDate(){
    this._api.get(App_API_Endpoints.common.getDevelopmentStates, {}).subscribe({
      next(value) {
        console.log('getDevelopmentStates', value);
      },
      error(err) {
        console.log('err', err);
      },
    });
    this._api.get(App_API_Endpoints.common.getWorkItems, {}).subscribe({
      next(value) {
        console.log('getWorkItems', value);
      },
      error(err) {
        console.log('err', err);
      },
    });
  }
}
