import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAttribute } from './add-attribute';

describe('AddAttribute', () => {
  let component: AddAttribute;
  let fixture: ComponentFixture<AddAttribute>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAttribute]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAttribute);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
