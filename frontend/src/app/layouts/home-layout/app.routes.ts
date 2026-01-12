import { Routes } from "@angular/router";
import { Blogs } from "../../components/blogs/blogs";
import { BlogFormComponent } from "../../components/blog-form/blog-form";
import { Profile } from "../../components/profile/profile";

export const routes:Routes=[
  { path: 'blogs', component: Blogs },
  { path: 'createBlog', component: BlogFormComponent },
  { path: 'profile', component: Profile },
]