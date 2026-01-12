import { Routes } from "@angular/router";
import { Login } from "../../components/login/login";
import { Register } from "../../components/register/register";

export const routes:Routes=[
// Login: only if NOT logged in
  { path: 'login', component: Login },

  // Register: only if NOT logged in
  { path: 'register', component: Register },
]