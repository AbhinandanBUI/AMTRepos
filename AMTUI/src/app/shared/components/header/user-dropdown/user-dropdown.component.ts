import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LocalStorageService } from '../../../../services/StorageServices/local-storage.service';
import { UserProfile } from '../../../../core/app-type-defination';

export interface Language {
  id: string;
  name: string;
  shortName: string;
  flag: string;
  badge?: string;
}

@Component({
  selector: 'app-user-dropdown',
  standalone: true,
  templateUrl: './user-dropdown.component.html',
  imports: [CommonModule, RouterModule]
})
export class UserDropdownComponent implements OnInit {
  isOpen = false;
  subDropdownOpen = false;
  currentLocale = 'en';

  languages: Language[] = [
    {
      id: 'en',
      name: 'English',
      shortName: 'English',
      flag: 'flag-us.svg',
    },
    {
      id: 'ar',
      name: 'Arabic (Saudi)',
      shortName: 'Arabic',
      flag: 'flag-sa.svg',
      badge: 'RTL',
    },
    {
      id: 'es',
      name: 'Español',
      shortName: 'Español',
      flag: 'flag-es.svg',
    },
    {
      id: 'de',
      name: 'Deutsch',
      shortName: 'Deutsch',
      flag: 'flag-de.svg',
    },
  ];
  userProfile: UserProfile|null = null;

  constructor(private elementRef: ElementRef,private _localStorage:LocalStorageService,private _router:Router) {}

  ngOnInit(): void {
    const savedDir = localStorage.getItem('dir');
    if (savedDir === 'rtl' || document.documentElement.getAttribute('dir') === 'rtl') {
      this.currentLocale = 'ar';
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      this.currentLocale = 'en';
      document.documentElement.setAttribute('dir', 'ltr');
    }
    this.getUserDetails();
  }

  get currentLang(): Language {
    return this.languages.find((l) => l.id === this.currentLocale) || this.languages[0];
  }

  toggleDropdown(event?: Event): void {
    event?.stopPropagation();
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.subDropdownOpen = false;
    }
  }

  closeDropdown(): void {
    this.isOpen = false;
    this.subDropdownOpen = false;
    this._localStorage.logout();
    this._router.navigate(['/signin']);
  }

  toggleSubDropdown(event: Event): void {
    event.stopPropagation();
    this.subDropdownOpen = !this.subDropdownOpen;
  }

  selectLanguage(id: string, event?: Event): void {
    event?.stopPropagation();
    this.currentLocale = id;
    if (id === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      localStorage.setItem('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      localStorage.setItem('dir', 'ltr');
    }
    this.closeDropdown();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  getUserDetails(){
    this.userProfile = this._localStorage.getUser();
    console.log('user',this.userProfile);

  }
}
