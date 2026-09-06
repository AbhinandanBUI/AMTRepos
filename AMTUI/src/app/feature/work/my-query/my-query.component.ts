import { Component, OnInit } from '@angular/core';
import { APP_User_Data, New_Work_Items, Work_Item_States } from '../../../core/app-constant-data';
 
interface WorkItem { id:string; type:string; title:string; state:string; assignedTo:string; storyPoint?:number }

@Component({
  standalone: false,
  selector: 'app-my-query',
  styleUrl: './my-query.component.css',
  templateUrl: './my-query.component.html',
})
export class MyQueryComponent implements OnInit {
  queryText = '';
  titleQ = '';
  typeQ = '';
  assigneeQ = '';
  stateQ = '';
  items: WorkItem[] = [];
  users = (APP_User_Data || []).slice();
  types = (New_Work_Items||[]).slice();
  stateOptions = (Work_Item_States||[]).map((s:any)=>s.Name);
  // Pagination
  pageSize = 8;
  currentPage = 1;

  ngOnInit(): void {
    // build demo items across types
    const types = this.types.length ? this.types : [{ Name: 'Task' }];
    types.forEach((t:any, idx:number) => {
      for (let i=1;i<=6;i++) {
        this.items.push({ id: `${t.Name}-${i}`, type: t.Name, title: `${t.Name} ${i} demo`, state: i%3===0? 'In Progress':'New', assignedTo: (this.users[i%this.users.length]?.Name) || 'Unassigned', storyPoint: (i%5)+1 });
      }
    });
  }

  parseQueryTokens(q:string) {
    const map:any = {};
    const re = /([a-zA-Z]+):"([^"]+)"|([a-zA-Z]+):([^\s]+)/g;
    let m: any;
    while ((m = re.exec(q)) !== null) {
      const key = m[1] || m[3];
      const val = m[2] || m[4];
      map[key.toLowerCase()] = val;
    }
    // free text (remove key:value parts)
    const free = q.replace(re, '').trim();
    return { map, free };
  }

  get filteredItems() {
    const q = (this.queryText || '').trim();
    const parsed = this.parseQueryTokens(q);
    return this.items.filter(it => {
      // token filters
      const m = parsed.map;
      if (m.type && it.type.toLowerCase() !== (m.type||'').toLowerCase()) return false;
      if (m.assignee && (it.assignedTo||'').toLowerCase() !== (m.assignee||'').toLowerCase()) return false;
      if (m.state && (it.state||'').toLowerCase() !== (m.state||'').toLowerCase()) return false;
      if (m.title && !(it.title||'').toLowerCase().includes((m.title||'').toLowerCase())) return false;
      // quick fields
      if (this.typeQ && it.type!==this.typeQ) return false;
      if (this.assigneeQ && it.assignedTo!==this.assigneeQ) return false;
      if (this.stateQ && it.state!==this.stateQ) return false;
      if (this.titleQ && !(it.title||'').toLowerCase().includes(this.titleQ.toLowerCase())) return false;
      // free text check
      if (parsed.free) {
        const f = parsed.free.toLowerCase();
        if (!((it.title||'').toLowerCase().includes(f) || (it.type||'').toLowerCase().includes(f) || (it.assignedTo||'').toLowerCase().includes(f))) return false;
      }
      return true;
    });
  }

  get totalResults() { return this.filteredItems.length; }
  get totalPages() { return Math.max(1, Math.ceil(this.totalResults / this.pageSize)); }
  get pages() { return Array.from({length: this.totalPages}, (_,i)=>i+1); }
  get pagedItems() {
    const start = (this.currentPage-1) * this.pageSize;
    return this.filteredItems.slice(start, start + this.pageSize);
  }

  setPage(n:number){
    if (n<1) n=1; if (n>this.totalPages) n=this.totalPages;
    this.currentPage = n;
  }
  prevPage(){ this.setPage(this.currentPage-1); }
  nextPage(){ this.setPage(this.currentPage+1); }
  setPageSize(n:number){ this.pageSize = n; this.currentPage = 1; }

  clear() {
    this.queryText = '';
    this.titleQ = this.typeQ = this.assigneeQ = this.stateQ = '';
  }

  // UI helpers
  private avatarColors = ['#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#22c55e','#06b6d4','#0ea5a4','#3b82f6','#6366f1','#a78bfa','#ec4899'];
  private typeColorMap: Record<string,string> = { 'Bug':'#ef4444','ChangeRequest':'#f97316','Epic':'#8b5cf6','Feature':'#3b82f6','Issue':'#fb7185','Task':'#10b981','UserStory':'#0ea5a4' };
  private stateColorMap: Record<string,string> = { 'New':'#60a5fa','In Progress':'#f59e0b','Resolved':'#34d399','Closed':'#94a3b8' };
  getAssigneeColor(name: string){ if (!name) return '#cbd5e1'; let s=0; for(let i=0;i<name.length;i++) s=(s*31+name.charCodeAt(i))>>>0; return this.avatarColors[s%this.avatarColors.length]; }
  getInitials(name: string){ if(!name) return ''; const p=name.split(' ').filter(Boolean); return p.length===1? p[0].charAt(0).toUpperCase() : (p[0].charAt(0)+p[1].charAt(0)).toUpperCase(); }
  getTypeColor(typeName:string){ return this.typeColorMap[typeName] || '#94a3b8'; }
  getStateColor(stateName:string){ return this.stateColorMap[stateName] || '#94a3b8'; }
}
