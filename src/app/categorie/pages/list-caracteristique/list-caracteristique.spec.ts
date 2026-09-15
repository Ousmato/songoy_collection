import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCaracteristique } from './list-caracteristique';

describe('ListCaracteristique', () => {
  let component: ListCaracteristique;
  let fixture: ComponentFixture<ListCaracteristique>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListCaracteristique]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListCaracteristique);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
