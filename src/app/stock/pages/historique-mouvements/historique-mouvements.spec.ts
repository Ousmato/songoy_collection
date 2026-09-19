import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriqueMouvements } from './historique-mouvements';

describe('HistoriqueMouvements', () => {
  let component: HistoriqueMouvements;
  let fixture: ComponentFixture<HistoriqueMouvements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoriqueMouvements]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoriqueMouvements);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
