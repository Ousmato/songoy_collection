import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDepensesAtelier } from './list-depenses-atelier';

describe('ListDepensesAtelier', () => {
  let component: ListDepensesAtelier;
  let fixture: ComponentFixture<ListDepensesAtelier>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListDepensesAtelier]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListDepensesAtelier);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
