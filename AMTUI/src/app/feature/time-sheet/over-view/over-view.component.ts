import { Component } from '@angular/core';

interface TimesheetDay {
  date: Date;
  dateKey: string;
  day: string;
  isWeekend: boolean;
  status: 'Pending' | 'Off';
  expectedHours: number;
}

@Component({
  standalone: false,
  selector: 'app-over-view',
  styleUrl: './over-view.component.css',
  templateUrl: './over-view.component.html',
})
export class OverViewComponent {
  selectedDate = this.toDateKey(new Date());
  weekLabel = '';
  days: TimesheetDay[] = [];

  constructor() {
    this.buildWeek(this.selectedDate);
  }

  get pendingDays(): number {
    return this.days.filter((day) => day.status === 'Pending').length;
  }

  get expectedHours(): number {
    return this.days.reduce((total, day) => total + day.expectedHours, 0);
  }

  onWeekDateChange(event: { dateStr: string }): void {
    if (event.dateStr) {
      this.buildWeek(event.dateStr);
    }
  }

  previousWeek(): void {
    this.buildWeek(this.toDateKey(this.addDays(this.getDate(this.selectedDate), -7)));
  }

  nextWeek(): void {
    this.buildWeek(this.toDateKey(this.addDays(this.getDate(this.selectedDate), 7)));
  }

  private buildWeek(dateKey: string): void {
    const monday = this.getMonday(this.getDate(dateKey));
    this.selectedDate = this.toDateKey(monday);
    this.days = Array.from({ length: 7 }, (_, index) => {
      const date = this.addDays(monday, index);
      const day = date.getDay();
      const isWeekend = day === 0 || day === 6;
      return {
        date,
        dateKey: this.toDateKey(date),
        day: date.toLocaleDateString('en-US', { weekday: 'long' }),
        isWeekend,
        status: isWeekend ? 'Off' : 'Pending',
        expectedHours: isWeekend ? 0 : 8,
      };
    });
    this.weekLabel = `${this.days[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${this.days[6].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
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
}
