import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReglementVente } from './reglement-vente';

describe('ReglementVente', () => {
  let component: ReglementVente;
  let fixture: ComponentFixture<ReglementVente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReglementVente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReglementVente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
