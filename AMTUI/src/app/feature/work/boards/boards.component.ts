import { Component } from '@angular/core';
import { New_Work_Items, APP_User_Data } from '../../../core/app-constant-data';


@Component({
 standalone: false,
  selector: 'app-boards',
  styleUrl: './boards.component.css',
  templateUrl: './boards.component.html',
})
export class BoardsComponent {
  lanes = ['To Do', 'In Progress', 'Review', 'Done'];
  workItemTypes = (New_Work_Items || []).slice();
  users = (APP_User_Data || []).slice();
  cards: any[] = [];
  filter: any = { q: '', type: '' };

  private avatarColors = ['#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#22c55e','#06b6d4','#0ea5a4','#3b82f6','#6366f1','#a78bfa','#ec4899'];
  private avatarPalette = ['#2563eb', '#0ea5e9', '#f97316', '#10b981', '#7c3aed', '#ef4444', '#06b6d4', '#f59e0b', '#a78bfa', '#7dd3fc'];
  private typeColorMap: Record<string,string> = {
    'Bug':'#ef4444','ChangeRequest':'#f97316','Epic':'#8b5cf6','Feature':'#3b82f6','Issue':'#fb7185','Observation':'#f59e0b','Risk':'#f43f5e','Subtask':'#06b6d4','Task':'#10b981','Test':'#6366f1','TestCase':'#7c3aed','UserStory':'#0ea5a4','User Story':'#0ea5a4'
  };

  getAssigneeColor(name: string){ if (!name) return '#cbd5e1'; let s=0; for(let i=0;i<name.length;i++) s=(s*31+name.charCodeAt(i))>>>0; return this.avatarPalette[s%this.avatarPalette.length]; }
  getInitials(name: string){ if(!name) return ''; const p=name.split(' ').filter(Boolean); return p.length===1? p[0].charAt(0).toUpperCase() : (p[0].charAt(0)+p[1].charAt(0)).toUpperCase(); }
  getTypeColor(typeName:string){ return this.typeColorMap[typeName] || '#94a3b8'; }

  constructor() {
    this.initSampleCards();
  }

  initSampleCards() {
    // create 9 sample cards across lanes
    const types = this.workItemTypes.length ? this.workItemTypes : [{ Name: 'Task' }];
    for (let i = 1; i <= 9; i++) {
      const t = types[i % types.length];
      const lane = this.lanes[i % this.lanes.length];
      const assignee = this.users[i % this.users.length]?.Name || 'Unassigned';
      this.cards.push({ id: `C${i}`, title: `${t.Name} ${i}`, type: t.Name, lane, assignee, points: (i%5)+1 });
    }
  }

  get cardsByLane() {
    const f = this.filter || {};
    return this.lanes.map(l => {
      let list = (this.cards || []).filter(c => c.lane === l);
      if (f.q) { const q = String(f.q).toLowerCase(); list = list.filter(c => (c.title||'').toLowerCase().includes(q)); }
      if (f.type) { list = list.filter(c => c.type === f.type); }
      return { lane: l, cards: list };
    });
  }

  moveCard(card: any, direction: 'left' | 'right') {
    const idx = this.lanes.indexOf(card.lane);
    if (idx === -1) return;
    const next = direction === 'right' ? Math.min(idx + 1, this.lanes.length - 1) : Math.max(idx - 1, 0);
    card.lane = this.lanes[next];
  }

  openCard(card: any) {
    alert(`Open card ${card.id}: ${card.title}`);
  }
}
