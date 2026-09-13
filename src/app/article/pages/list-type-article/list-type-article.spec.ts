import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTypeArticle } from './list-type-article';

describe('ListTypeArticle', () => {
  let component: ListTypeArticle;
  let fixture: ComponentFixture<ListTypeArticle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListTypeArticle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListTypeArticle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
