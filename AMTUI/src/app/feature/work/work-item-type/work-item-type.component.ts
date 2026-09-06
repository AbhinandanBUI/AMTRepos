import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-work-item-type',
    template: `
  <div class="work-item-type page-card">
    <div class="page-header">
      <h2>{{ displayName }}</h2>
      <div class="subtitle">Agile view for {{ displayName }} — backlog, board and details</div>
    </div>

    <div class="grid">
      <section class="overview card-section">
        <h3>Overview</h3>
        <p>Summary and quick stats for {{ displayName }} items.</p>
        <ul>
          <li>Open: --</li>
          <li>In Progress: --</li>
          <li>Resolved: --</li>
        </ul>
      </section>

      <section class="backlog card-section">
        <h3>Backlog</h3>
        <p>Backlog list filtered to {{ displayName }} work items.</p>
        <div class="placeholder">(Backlog list goes here)</div>
      </section>

      <section class="board card-section">
        <h3>Board</h3>
        <p>Kanban board lanes (To Do / In Progress / Done) for {{ displayName }}.</p>
        <div class="placeholder">(Board preview)</div>
      </section>

      <section class="details card-section">
        <h3>Details</h3>
        <label class="field"><div class="label">Acceptance Criteria</div>
          <textarea rows="3" class="field-input" placeholder="Acceptance criteria for this item type"></textarea>
        </label>
        <label class="field"><div class="label">Design Notes</div>
          <textarea rows="3" class="field-input" placeholder="Design or implementation notes"></textarea>
        </label>
        <label class="field"><div class="label">Subtasks</div>
          <div class="placeholder">(Subtask list)</div>
        </label>
      </section>
    </div>
  </div>
  `,
    styles: [
        `.page-card { padding:1rem; }
    .page-header h2 { margin:0; }
    .grid{ display:grid; grid-template-columns: 1fr 1fr; gap:1rem; }
    .card-section{ padding:0.75rem; background:#fbfdff; border:1px solid #f1f5f9; border-radius:8px }
    .placeholder{ color:#6b7280; padding:0.5rem; background:#ffffff; border:1px dashed #e6eef8; border-radius:6px }
    @media (max-width:900px){ .grid{ grid-template-columns: 1fr } }
    `
    ],
    standalone: false,
})
export class WorkItemTypeComponent {
    typeParam = '';
    displayName = '';
    constructor(private route: ActivatedRoute) {
        this.route.paramMap.subscribe((p) => {
            const t = p.get('type') || '';
            this.typeParam = t;
            this.displayName = this.toDisplayName(t);
        });
    }

    toDisplayName(t: string) {
        if (!t) return '';
        // convert kebab or camel to Title Case
        return t.replace(/[-_]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
    }
}
