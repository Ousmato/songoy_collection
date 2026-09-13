import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPersonnel } from './list-personnel';

describe('ListPersonnel', () => {
  let component: ListPersonnel;
  let fixture: ComponentFixture<ListPersonnel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPersonnel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListPersonnel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
