import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDepense } from './add-depense';

describe('AddDepense', () => {
  let component: AddDepense;
  let fixture: ComponentFixture<AddDepense>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDepense]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddDepense);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
