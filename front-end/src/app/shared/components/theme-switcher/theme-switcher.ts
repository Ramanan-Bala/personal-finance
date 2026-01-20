import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'theme-switcher',
  imports: [],
  templateUrl: './theme-switcher.html',
  styleUrl: './theme-switcher.css',
})
export class ThemeSwitcher implements OnInit {
  theme = 'light';

  ngOnInit() {
    // Check for saved user preference, if any, on load of this component
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.theme = savedTheme;
    } else {
      // If no saved preference, check the system preference
      const prefersDark =
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.theme = prefersDark ? 'dark' : 'light';
    }
    // Apply the theme to the body
    if (this.theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', this.theme);
  }
}
