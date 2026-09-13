import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTypeArticle } from './add-type-article';

describe('AddTypeArticle', () => {
  let component: AddTypeArticle;
  let fixture: ComponentFixture<AddTypeArticle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTypeArticle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTypeArticle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
