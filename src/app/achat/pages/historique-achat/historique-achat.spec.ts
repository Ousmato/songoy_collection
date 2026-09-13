import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriqueAchat } from './historique-achat';

describe('HistoriqueAchat', () => {
  let component: HistoriqueAchat;
  let fixture: ComponentFixture<HistoriqueAchat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoriqueAchat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoriqueAchat);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
