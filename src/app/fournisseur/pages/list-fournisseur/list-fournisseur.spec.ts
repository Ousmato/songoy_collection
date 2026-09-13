import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFournisseur } from './list-fournisseur';

describe('ListFournisseur', () => {
  let component: ListFournisseur;
  let fixture: ComponentFixture<ListFournisseur>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListFournisseur]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListFournisseur);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
