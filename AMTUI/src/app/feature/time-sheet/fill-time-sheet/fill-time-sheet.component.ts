import { Component } from '@angular/core';

interface DailyEntry {
  date: Date;
  dateKey: string;
  day: string;
  isWeekend: boolean;
  tasks: DailyTask[];
}

interface DailyTask {
  task: string;
  hours: number;
  notes: string;
}

@Component({
  standalone: false,
  selector: 'app-fill-time-sheet',
  styleUrl: './fill-time-sheet.component.css',
  templateUrl: './fill-time-sheet.component.html',
})
export class FillTimeSheetComponent {
  selectedDate = this.toDateKey(new Date());
  selectedProject = 'Ajile Management Tool';
  weekLabel = '';
  entries: DailyEntry[] = [];
  projects = ['Ajile Management Tool', 'Customer Portal', 'Internal Tools', 'Mobile Application'];
  tasks = ['Improve work item filters', 'Review dashboard copy', 'Build timesheet summary', 'Team planning'];
  saved = false;

  constructor() {
    this.buildWeek(this.selectedDate);
  }

  get totalHours(): number {
    return this.entries.reduce((total, entry) => total + this.getDayHours(entry), 0);
  }

  get enteredDays(): number {
    return this.entries.filter((entry) => !entry.isWeekend && this.getDayHours(entry) > 0).length;
  }

  onWeekDateChange(event: { dateStr: string }): void {
    if (event.dateStr) {
      this.selectedDate = event.dateStr;
      this.buildWeek(event.dateStr);
    }
  }

  previousWeek(): void {
    this.buildWeek(this.toDateKey(this.addDays(this.getDate(this.selectedDate), -7)));
  }

  nextWeek(): void {
    this.buildWeek(this.toDateKey(this.addDays(this.getDate(this.selectedDate), 7)));
  }

  saveEntries(): void {
    if (!this.selectedProject) {
      return;
    }

    this.saved = true;
    window.setTimeout(() => this.saved = false, 2500);
  }

  addTask(entry: DailyEntry): void {
    if (!entry.isWeekend) {
      entry.tasks.push(this.createTask());
    }
  }

  removeTask(entry: DailyEntry, taskIndex: number): void {
    if (entry.tasks.length > 1) {
      entry.tasks.splice(taskIndex, 1);
    }
  }

  getDayHours(entry: DailyEntry): number {
    return entry.tasks.reduce((total, task) => total + (Number(task.hours) || 0), 0);
  }

  private buildWeek(dateKey: string): void {
    const monday = this.getMonday(this.getDate(dateKey));
    this.selectedDate = this.toDateKey(monday);
    this.entries = Array.from({ length: 7 }, (_, index) => {
      const date = this.addDays(monday, index);
      const day = date.getDay();
      const isWeekend = day === 0 || day === 6;
      return {
        date,
        dateKey: this.toDateKey(date),
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        isWeekend,
        tasks: isWeekend ? [] : [this.createTask()],
      };
    });
    this.weekLabel = `${this.entries[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${this.entries[6].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }

  private getMonday(date: Date): Date {
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = monday.getDay();
    monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
    return monday;
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private getDate(dateKey: string): Date {
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private toDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private createTask(): DailyTask {
    return {
      task: 'Improve work item filters',
      hours: 8,
      notes: '',
    };
  }
}
