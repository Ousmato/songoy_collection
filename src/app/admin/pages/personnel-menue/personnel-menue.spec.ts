import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonnelMenue } from './personnel-menue';

describe('PersonnelMenue', () => {
  let component: PersonnelMenue;
  let fixture: ComponentFixture<PersonnelMenue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonnelMenue]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonnelMenue);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
