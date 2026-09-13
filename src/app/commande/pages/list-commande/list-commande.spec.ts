import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCommande } from './list-commande';

describe('ListCommande', () => {
  let component: ListCommande;
  let fixture: ComponentFixture<ListCommande>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListCommande]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListCommande);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
