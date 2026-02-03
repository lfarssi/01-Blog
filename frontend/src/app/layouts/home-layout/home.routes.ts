import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../components/blogs/blogs').then((m) => m.Blogs),
  },

  {
    path: 'blogs/:id',
    loadComponent: () =>
      import('../../components/blog-detail/blog-detail').then((m) => m.BlogDetail),
  },
  {
    path: 'blogs/:id/edit',
    loadComponent: () =>
      import('../../components/edit-blog/edit-blog').then((m) => m.EditBlogComponent),
  },

  {
    path: 'create_blog',
    loadComponent: () =>
      import('../../components/blog-form/blog-form').then((m) => m.BlogFormComponent),
  },

  {
    path: 'profile/:id',
    loadComponent: () =>
      import('../../components/profile/profile').then((m) => m.ProfileComponent),
  },

  {
    path: 'notifications',
    loadComponent: () =>
      import('../../components/notifications/notifications').then(
        (m) => m.NotificationsComponent
      ),
  },

  {
    path: 'admin/users',
    loadComponent: () =>
      import('../../components/admin/admin-users/admin-users').then(
        (m) => m.AdminUsers
      ),
  },
  {
    path: 'admin/blogs',
    loadComponent: () =>
      import('../../components/admin/admin-blogs/admin-blogs').then(
        (m) => m.AdminBlogs
      ),
  },
  {
    path: 'admin/reports',
    loadComponent: () =>
      import('../../components/admin/admin-reports/admin-reports').then(
        (m) => m.AdminReports
      ),
  },
];
