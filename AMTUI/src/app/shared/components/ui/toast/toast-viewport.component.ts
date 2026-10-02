import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-toast-viewport',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="toast-stack" aria-label="Notifications" aria-live="polite" aria-relevant="additions">
      @for (toast of toastService.messages(); track toast.id) {
        <article class="toast" [class]="'toast toast--' + toast.level" [attr.role]="toast.level === 'error' ? 'alert' : 'status'">
          <span class="toast-mark" aria-hidden="true">{{iconFor(toast.level)}}</span>
          <div class="toast-copy"><strong>{{toast.title}}</strong><p>{{toast.message}}</p></div>
          <button type="button" class="toast-close" aria-label="Dismiss notification" (click)="toastService.dismiss(toast.id)">×</button>
        </article>
      }
    </section>
  `,
  styles: [`
    :host { inset-block-end: 1rem; inset-inline-end: 1rem; pointer-events: none; position: fixed; z-index: 10000; }
    .toast-stack { display: grid; gap: 0.55rem; max-width: min(24rem, calc(100vw - 2rem)); }
    .toast { align-items: flex-start; animation: toast-enter 180ms ease-out; background: #fff; border: 1px solid #dce6e4; border-inline-start: 4px solid #087e78; border-radius: 6px; box-shadow: 0 8px 28px #102a2a20; color: #1f3438; display: grid; gap: 0.65rem; grid-template-columns: auto minmax(0, 1fr) auto; padding: 0.75rem; pointer-events: auto; }
    .toast--success { border-inline-start-color: #16845b; }
    .toast--error { border-inline-start-color: #bd4936; }
    .toast--warning { border-inline-start-color: #b7791f; }
    .toast--info { border-inline-start-color: #087e78; }
    .toast-mark { align-items: center; background: #e7f4ee; border-radius: 50%; color: #16845b; display: inline-flex; font-size: 0.76rem; font-weight: 800; height: 1.35rem; justify-content: center; width: 1.35rem; }
    .toast--error .toast-mark { background: #fff0ed; color: #bd4936; }
    .toast--warning .toast-mark { background: #fff5df; color: #9c6718; }
    .toast--info .toast-mark { background: #e2f0ef; color: #087e78; }
    .toast-copy { min-width: 0; }
    .toast-copy strong { display: block; font-size: 0.8rem; line-height: 1.25; }
    .toast-copy p { color: #63777a; font-size: 0.77rem; line-height: 1.35; margin: 0.15rem 0 0; overflow-wrap: anywhere; }
    .toast-close { background: transparent; border: 0; color: #63777a; cursor: pointer; font-size: 1.2rem; line-height: 1; padding: 0 0.15rem; }
    @keyframes toast-enter { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 480px) { :host { inset-block-end: 0.75rem; inset-inline: 0.75rem; } .toast-stack { max-width: none; } }
    @media (prefers-reduced-motion: reduce) { .toast { animation: none; } }
  `],
})
export class ToastViewportComponent {
  readonly toastService = inject(ToastService);

  iconFor(level: string): string {
    return level === 'success' ? '✓' : level === 'error' ? '!' : level === 'warning' ? '!' : 'i';
  }
}