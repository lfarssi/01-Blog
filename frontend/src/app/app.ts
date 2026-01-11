import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Header,
    Footer,

  ],
  template: `
    @if (showLayout) {
      <app-header />
    }
    <main>
      <router-outlet />
    </main>
    @if (showLayout) {
      <app-footer />
    }
  `,
  styles: []
})
export class App {
  protected readonly title = 'frontend';
  showLayout = true; // Show header/footer by default

  constructor(private router: Router) {
    // Listen to route changes
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Hide layout on login and register
        const hideOn = ['/login', '/register'];
        this.showLayout = !hideOn.includes(event.urlAfterRedirects);
      }
    });
  }
}
