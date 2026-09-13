import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterAchat } from './ajouter-achat';

describe('AjouterAchat', () => {
  let component: AjouterAchat;
  let fixture: ComponentFixture<AjouterAchat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AjouterAchat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AjouterAchat);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
