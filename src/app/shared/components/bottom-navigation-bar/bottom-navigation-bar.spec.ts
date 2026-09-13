import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomNavigationBar } from './bottom-navigation-bar';

describe('BottomNavigationBar', () => {
  let component: BottomNavigationBar;
  let fixture: ComponentFixture<BottomNavigationBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNavigationBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BottomNavigationBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
