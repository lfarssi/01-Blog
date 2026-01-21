import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';

@Component({
  selector: 'app-home-layout',
  imports: [RouterOutlet, Header],
  templateUrl: './home-layout.html',
  styleUrl: './home-layout.scss',
})
export class HomeLayout {

}
