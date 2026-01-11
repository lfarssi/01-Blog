import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogForm } from './blog-form';

describe('BlogForm', () => {
  let component: BlogForm;
  let fixture: ComponentFixture<BlogForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
