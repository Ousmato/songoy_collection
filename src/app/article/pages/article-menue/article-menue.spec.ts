import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleMenue } from './article-menue';

describe('ArticleMenue', () => {
  let component: ArticleMenue;
  let fixture: ComponentFixture<ArticleMenue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleMenue]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticleMenue);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
