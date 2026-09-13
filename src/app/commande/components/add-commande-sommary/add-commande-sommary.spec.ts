import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCommandeSommary } from './add-commande-sommary';

describe('AddCommandeSommary', () => {
  let component: AddCommandeSommary;
  let fixture: ComponentFixture<AddCommandeSommary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCommandeSommary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCommandeSommary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
