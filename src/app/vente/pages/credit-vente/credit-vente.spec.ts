import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditVente } from './credit-vente';

describe('CreditVente', () => {
  let component: CreditVente;
  let fixture: ComponentFixture<CreditVente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditVente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditVente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
