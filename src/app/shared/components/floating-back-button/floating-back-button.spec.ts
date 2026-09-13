import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingBackButton } from './floating-back-button';

describe('FloatingBackButton', () => {
  let component: FloatingBackButton;
  let fixture: ComponentFixture<FloatingBackButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingBackButton],
    }).compileComponents();

    fixture = TestBed.createComponent(FloatingBackButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
