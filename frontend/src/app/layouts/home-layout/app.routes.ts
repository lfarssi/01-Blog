import { Routes } from "@angular/router";
import { Blogs } from "../../components/blogs/blogs";
import { BlogFormComponent } from "../../components/blog-form/blog-form";
import { ProfileComponent } from "../../components/profile/profile";
import { BlogDetail } from "../../components/blog-detail/blog-detail";
import { UsersComponent } from "../../components/users/users";

export const routes:Routes=[
 { 
    path: '', 
    component: Blogs,  // Parent for home
    children: [
      { path: '', component: UsersComponent, outlet: 'sidebar' }  // Named outlet for users
    ]
  },
    { path: 'blogs/:id', component: BlogDetail },

  { path: 'create_blog', component: BlogFormComponent },
  { path: 'profile/:id', component: ProfileComponent },
]