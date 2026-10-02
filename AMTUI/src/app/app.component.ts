import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastViewportComponent } from './shared/components/ui/toast/toast-viewport.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    ToastViewportComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'Ajile Management Tool';

  ngOnInit(): void {
    const savedDir = localStorage.getItem('dir');
    if (savedDir === 'rtl') {
      document.documentElement.setAttribute('dir', 'rtl');
    }
  }
}
