import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriquePaiement } from './historique-paiement';

describe('HistoriquePaiement', () => {
  let component: HistoriquePaiement;
  let fixture: ComponentFixture<HistoriquePaiement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoriquePaiement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoriquePaiement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
