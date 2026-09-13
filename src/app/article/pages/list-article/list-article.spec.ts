import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListArticle } from './list-article';

describe('ListArticle', () => {
  let component: ListArticle;
  let fixture: ComponentFixture<ListArticle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListArticle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListArticle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
