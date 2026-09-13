import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListVente } from './list-vente';

describe('ListVente', () => {
  let component: ListVente;
  let fixture: ComponentFixture<ListVente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListVente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListVente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
