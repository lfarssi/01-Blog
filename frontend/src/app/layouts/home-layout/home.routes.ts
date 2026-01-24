import { Routes } from '@angular/router';
import { Blogs } from '../../components/blogs/blogs';
import { BlogFormComponent } from '../../components/blog-form/blog-form';
import { ProfileComponent } from '../../components/profile/profile';
import { BlogDetail } from '../../components/blog-detail/blog-detail';
import { EditBlogComponent } from '../../components/edit-blog/edit-blog';

export const routes: Routes = [
  { path: '', component: Blogs },

  { path: 'blogs/:id', component: BlogDetail },
  { path: 'blogs/:id/edit', component: EditBlogComponent },

  { path: 'create_blog', component: BlogFormComponent },
  { path: 'profile/:id', component: ProfileComponent },
];
