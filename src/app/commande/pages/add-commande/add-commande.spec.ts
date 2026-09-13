import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCommande } from './add-commande';

describe('AddCommande', () => {
  let component: AddCommande;
  let fixture: ComponentFixture<AddCommande>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCommande]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCommande);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
