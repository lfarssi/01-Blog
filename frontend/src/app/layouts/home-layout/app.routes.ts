import { Routes } from "@angular/router";
import { Blogs } from "../../components/blogs/blogs";
import { BlogFormComponent } from "../../components/blog-form/blog-form";
import { ProfileComponent } from "../../components/profile/profile";
import { BlogDetail } from "../../components/blog-detail/blog-detail";

export const routes:Routes=[
  { path: 'blogs', component: Blogs },
    { path: 'blogs/:id', component: BlogDetail },

  { path: 'create_blog', component: BlogFormComponent },
  { path: 'profile', component: ProfileComponent },
]