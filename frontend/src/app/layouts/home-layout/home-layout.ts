import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { UsersComponent } from '../../components/users/users';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-home-layout',
  imports: [RouterOutlet, Header, UsersComponent, MatIcon],
  templateUrl: './home-layout.html',
  styleUrl: './home-layout.scss',
})
export class HomeLayout {
showUsers = false;

}
