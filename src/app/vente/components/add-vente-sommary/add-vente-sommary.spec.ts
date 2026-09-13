import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddVenteSommary } from './add-vente-sommary';

describe('AddVenteSommary', () => {
  let component: AddVenteSommary;
  let fixture: ComponentFixture<AddVenteSommary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddVenteSommary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddVenteSommary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
