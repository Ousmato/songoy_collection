import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VeteMenue } from './vete-menue';

describe('VeteMenue', () => {
  let component: VeteMenue;
  let fixture: ComponentFixture<VeteMenue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VeteMenue],
    }).compileComponents();

    fixture = TestBed.createComponent(VeteMenue);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
