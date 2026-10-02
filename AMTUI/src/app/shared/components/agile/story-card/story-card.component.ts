import { Component, Input } from '@angular/core';
import { AgileIssue } from '../../../../feature/work/agile.models';

@Component({
  selector: 'app-story-card',
  standalone: true,
  templateUrl: './story-card.component.html',
  styleUrl: './story-card.component.css',
})
export class StoryCardComponent {
  @Input({ required: true }) issue!: AgileIssue;

  get assigneeName(): string {
    return this.issue.assigneeRef?.fullName || 'Unassigned';
  }

  get assigneeInitials(): string {
    return this.assigneeName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  get avatarUrl(): string | null {
    return this.issue.assigneeRef?.avatar?.url || null;
  }
}