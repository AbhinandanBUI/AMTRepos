import { Injectable, signal } from '@angular/core';

export type ToastLevel = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: number;
  level: ToastLevel;
  title: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly messages = signal<ToastMessage[]>([]);
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private nextId = 0;

  success(message: string, title = 'Saved'): void {
    this.show('success', title, message);
  }

  error(message: string, title = 'Something went wrong'): void {
    this.show('error', title, message, 6000);
  }

  info(message: string, title = 'Info'): void {
    this.show('info', title, message);
  }

  warning(message: string, title = 'Check this'): void {
    this.show('warning', title, message);
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer) clearTimeout(timer);
    this.timers.delete(id);
    this.messages.update((messages) => messages.filter((item) => item.id !== id));
  }

  private show(level: ToastLevel, title: string, message: string, duration = 4000): void {
    const id = ++this.nextId;
    this.messages.update((messages) => [...messages, { id, level, title, message }]);
    const timer = setTimeout(() => this.dismiss(id), duration);
    this.timers.set(id, timer);
  }
}