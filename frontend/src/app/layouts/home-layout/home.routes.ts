import { Routes } from '@angular/router';
import { Blogs } from '../../components/blogs/blogs';
import { BlogFormComponent } from '../../components/blog-form/blog-form';
import { ProfileComponent } from '../../components/profile/profile';
import { BlogDetail } from '../../components/blog-detail/blog-detail';
import { EditBlogComponent } from '../../components/edit-blog/edit-blog';
import { NotificationsComponent } from '../../components/notifications/notifications';
import { AdminUsers } from '../../components/admin/admin-users/admin-users';
import { AdminBlogs } from '../../components/admin/admin-blogs/admin-blogs';
import { AdminReports } from '../../components/admin/admin-reports/admin-reports';

export const routes: Routes = [
  { path: '', component: Blogs },

  { path: 'blogs/:id', component: BlogDetail },
  { path: 'blogs/:id/edit', component: EditBlogComponent },

  { path: 'create_blog', component: BlogFormComponent },
  { path: 'profile/:id', component: ProfileComponent },
  {path:'notifications', component:NotificationsComponent},
  {path:'admin/users', component:AdminUsers},
  {path:'admin/blogs', component:AdminBlogs},
  {path:'admin/reports', component:AdminReports},
];
