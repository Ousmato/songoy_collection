import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPersonnel } from './add-personnel';

describe('AddPersonnel', () => {
  let component: AddPersonnel;
  let fixture: ComponentFixture<AddPersonnel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPersonnel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPersonnel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
