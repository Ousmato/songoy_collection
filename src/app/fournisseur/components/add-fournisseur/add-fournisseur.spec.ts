import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFournisseur } from './add-fournisseur';

describe('AddFournisseur', () => {
  let component: AddFournisseur;
  let fixture: ComponentFixture<AddFournisseur>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFournisseur]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddFournisseur);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
