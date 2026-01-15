import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Follow } from './follow';

describe('Follow', () => {
  let component: Follow;
  let fixture: ComponentFixture<Follow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Follow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Follow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
