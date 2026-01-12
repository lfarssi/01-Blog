import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
   

  ],
  template: `
   
    <main>
      <router-outlet />
    </main>
   
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
