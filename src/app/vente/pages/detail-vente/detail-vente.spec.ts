import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailVente } from './detail-vente';

describe('DetailVente', () => {
  let component: DetailVente;
  let fixture: ComponentFixture<DetailVente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailVente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailVente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
