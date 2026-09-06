import { Component } from '@angular/core';
import { New_Work_Items, APP_User_Data } from '../../../core/app-constant-data';


@Component({
 standalone: false,
  selector: 'app-sprints',
  styleUrl: './sprints.component.css',
  templateUrl: './sprints.component.html',
})
export class SprintsComponent {
  sprints: any[] = [];
  backlogItems: any[] = [];
  users = (APP_User_Data || []).slice();
  selectedSprint: any = null;
  showCreate = false;
  roles: string[] = ['Dev','QA','BA','UX','PM'];
  newSprintName = '';
  newSprintStart = '';
  newSprintEnd = '';
  newSprintCapacities: any = {};

  private avatarColors = ['#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#22c55e','#06b6d4','#0ea5a4','#3b82f6','#6366f1','#a78bfa','#ec4899'];

  getAssigneeColor(name: string){ if (!name) return '#cbd5e1'; let s=0; for(let i=0;i<name.length;i++) s=(s*31+name.charCodeAt(i))>>>0; return this.avatarColors[s%this.avatarColors.length]; }
  getInitials(name: string){ if(!name) return ''; const p=name.split(' ').filter(Boolean); return p.length===1? p[0].charAt(0).toUpperCase() : (p[0].charAt(0)+p[1].charAt(0)).toUpperCase(); }

  constructor() {
    this.initSampleData();
  }

  initSampleData() {
    // sample sprints
    for (let i = 1; i <= 4; i++) {
      const capacities: any = {};
      capacities.Dev = 20 + i * 2;
      capacities.QA = 6 + i;
      capacities.BA = 4;
      capacities.UX = 4;
      capacities.PM = 2;
      this.sprints.push({ id: i, name: `Sprint ${i}`, start: this.addDays(new Date(), (i-1)*14), end: this.addDays(new Date(), i*14-1), capacities, velocity: 20 });
    }
    // sample backlog items
    for (let j = 1; j <= 12; j++) {
      this.backlogItems.push({ id: `B${j}`, title: `Backlog item ${j}`, points: (j%5)+1, assignee: this.users[j % this.users.length]?.Name || 'Unassigned', sprintId: null });
    }
    if (this.sprints.length) this.selectedSprint = this.sprints[0];
    // initialize new sprint form capacities
    this.resetNewSprintCaps();
  }

  resetNewSprintCaps() {
    this.newSprintCapacities = {};
    this.roles.forEach(r => this.newSprintCapacities[r] = 0);
  }

  addDays(d: Date, days: number) { const r = new Date(d); r.setDate(r.getDate() + days); return r; }

  selectSprint(s: any) { this.selectedSprint = s; }

  toggleCreate() { this.showCreate = !this.showCreate; }

  createSprint(name: string, start: string, end: string, capacities?: any) {
    if (!name) return;
    const id = (this.sprints.length ? Math.max(...this.sprints.map(s=>s.id)) : 0) + 1;
    const caps: any = {};
    this.roles.forEach(r => caps[r] = (capacities && capacities[r]) ? Number(capacities[r]) : 0);
    const s = { id, name, start: new Date(start), end: new Date(end), capacities: caps, velocity: 0 };
    this.sprints.push(s);
    this.selectedSprint = s;
    this.showCreate = false;
    this.newSprintName = '';
    this.newSprintStart = '';
    this.newSprintEnd = '';
    this.resetNewSprintCaps();
  }

  assignToSprint(item: any) {
    if (!this.selectedSprint) return;
    item.sprintId = this.selectedSprint.id;
  }

  unassignFromSprint(item: any) { item.sprintId = null; }
}
