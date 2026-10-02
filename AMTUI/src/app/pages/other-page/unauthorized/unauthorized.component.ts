import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="unauthorized-page">
      <p class="eyebrow">ACCESS RESTRICTED</p>
      <h1>You do not have access to this area.</h1>
      <p>Ask an administrator to update your account role.</p>
      <a [routerLink]="returnUrl">Return to previous section</a>
    </main>
  `,
  styles: [`
    .unauthorized-page { color: #1f3438; margin: 12vh auto; max-width: 34rem; padding: 1.5rem; text-align: center; }
    .eyebrow { color: #087e78; font-size: 0.72rem; font-weight: 800; }
    h1 { font-size: 1.8rem; margin: 0.5rem 0; }
    p { color: #63777a; }
    a { color: #087e78; display: inline-block; font-weight: 700; margin-top: 1.2rem; }
  `],
})
export class UnauthorizedComponent {
  private readonly requestedReturnUrl = inject(ActivatedRoute).snapshot.queryParamMap.get('returnTo');

  get returnUrl(): string {
    const path = this.requestedReturnUrl;
    return path?.startsWith('/') && !path.startsWith('//') ? path : '/';
  }
}