import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriqueDepense } from './historique-depense';

describe('HistoriqueDepense', () => {
  let component: HistoriqueDepense;
  let fixture: ComponentFixture<HistoriqueDepense>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoriqueDepense]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoriqueDepense);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
