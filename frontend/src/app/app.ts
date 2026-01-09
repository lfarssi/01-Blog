import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Home } from './home/home';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, Login, Register, Home],
  template: `
    <app-header />
      <main>
         <app-home />
        <app-login />
        <app-register />
      </main>
     
    <app-footer />

    <router-outlet />
  `,
  styles: [],
})
export class App {
  protected readonly title = signal('frontend');
}
