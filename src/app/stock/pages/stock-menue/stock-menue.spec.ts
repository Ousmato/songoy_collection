import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockMenue } from './stock-menue';

describe('StockMenue', () => {
  let component: StockMenue;
  let fixture: ComponentFixture<StockMenue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockMenue],
    }).compileComponents();

    fixture = TestBed.createComponent(StockMenue);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
