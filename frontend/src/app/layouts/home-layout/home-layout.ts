import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { UsersComponent } from '../../components/users/users';

@Component({
  selector: 'app-home-layout',
  imports: [RouterOutlet, Header, UsersComponent],
  templateUrl: './home-layout.html',
  styleUrl: './home-layout.scss',
})
export class HomeLayout {

}
