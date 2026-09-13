import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddVente } from './add-vente';

describe('AddVente', () => {
  let component: AddVente;
  let fixture: ComponentFixture<AddVente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddVente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddVente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
