import { Component, OnInit, ViewChild } from '@angular/core';
import { Id_Name_Type } from '../../../core/app-type-defination';
import { New_Work_Items, APP_User_Data, Work_Item_States } from '../../../core/app-constant-data';
import { WorkItemCreateComponent } from '../work-item-create/work-item-create.component';



@Component({
  standalone: false,
  selector: 'app-work-items',
  styleUrl: './work-items.component.css',
  templateUrl: './work-items.component.html',
})
export class WorkItemsComponent implements OnInit {
  workItemLists: Id_Name_Type[] = [];
  workItemTypes: any[] = [];
  selectedType: any = null;
  items: any[] = [];
  filterQ = '';
  showEditor = false;
  editingItem: any = null;
  editingId: any = null;
  tempEdit: any = null;
  users = (APP_User_Data || []).slice();
  stateOptions = (Work_Item_States || []).map((s:any) => s.Name);

  @ViewChild('editor', { static: false }) editor?: WorkItemCreateComponent;

  ngOnInit(): void {
    this.workItemLists = New_Work_Items;
    this.workItemTypes = (New_Work_Items || []).slice();
    if (this.workItemTypes.length) this.selectType(this.workItemTypes[0]);
  }

  selectType(t: any) {
    this.selectedType = t;
    this.items = this.generateSampleItemsFor(t, 8);
  }

  generateSampleItemsFor(type: any, count = 6) {
    const arr: any[] = [];
    for (let i = 1; i <= count; i++) {
      arr.push({ id: `${type.Name}-${i}`, type: type.Name, title: `${type.Name} ${i} sample`, state: i%3===0?'In Progress':'New', assignedTo: 'Unassigned', storyPoint: (i%5)+1 });
    }
    return arr;
  }

  get filteredItems() {
    const q = (this.filterQ || '').toLowerCase();
    return this.items.filter(i => !q || (i.title || '').toLowerCase().includes(q));
  }

  openEditor(item?: any) {
    this.editingItem = item ? JSON.parse(JSON.stringify(item)) : { title: '', type: this.selectedType?.Name || '', state: 'New' };
    this.showEditor = true;
    // set editor model when available
    setTimeout(() => {
      if (this.editor) this.editor.model = JSON.parse(JSON.stringify(this.editingItem));
    }, 0);
  }

  // Inline row editing (edit in-grid except Title is readonly)
  beginInlineEdit(item: any) {
    this.editingId = item.id;
    this.tempEdit = JSON.parse(JSON.stringify(item));
  }

  cancelInlineEdit() {
    this.editingId = null;
    this.tempEdit = null;
  }

  saveInlineEdit() {
    if (!this.editingId || !this.tempEdit) return;
    const idx = this.items.findIndex(i=>i.id===this.editingId);
    if (idx>=0) {
      // preserve title, but update other fields
      const title = this.items[idx].title;
      this.items[idx] = { ...this.tempEdit, title };
    }
    this.cancelInlineEdit();
  }

  closeEditor() {
    this.showEditor = false;
    this.editingItem = null;
  }

  // Helpers for consistent UI
  // color palettes and canonical maps (shared with editor)
  private avatarPalette = ['#2563eb', '#0ea5e9', '#f97316', '#10b981', '#7c3aed', '#ef4444', '#06b6d4', '#f59e0b', '#a78bfa', '#7dd3fc'];
  private stateColorMap: Record<string,string> = {
    'New':'#0ea5e9','Active':'#f59e0b','In Progress':'#f97316','Resolved':'#10b981','Closed':'#6b7280','Blocked':'#ef4444'
  };
  private typeColorMap: Record<string,string> = {
    'Bug':'#ef4444','ChangeRequest':'#f97316','Epic':'#8b5cf6','Feature':'#3b82f6','Issue':'#fb7185','Observation':'#f59e0b','Risk':'#f43f5e','Subtask':'#06b6d4','Task':'#10b981','Test':'#6366f1','TestCase':'#7c3aed','UserStory':'#0ea5a4','User Story':'#0ea5a4'
  };

  getAssigneeColor(name: string){ if (!name) return '#cbd5e1'; let s=0; for(let i=0;i<name.length;i++) s=(s*31+name.charCodeAt(i))>>>0; return this.avatarPalette[s%this.avatarPalette.length]; }
  getInitials(name: string){ if(!name) return ''; const p=name.split(' ').filter(Boolean); return p.length===1? p[0].charAt(0).toUpperCase() : (p[0].charAt(0)+p[1].charAt(0)).toUpperCase(); }
  getStateColor(state:string){ if(!state) return '#94a3b8'; return this.stateColorMap[state] || '#94a3b8'; }
  getTypeColor(typeName:string){ return this.typeColorMap[typeName] || '#94a3b8'; }

}
