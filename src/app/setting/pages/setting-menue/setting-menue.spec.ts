import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingMenue } from './setting-menue';

describe('SettingMenue', () => {
  let component: SettingMenue;
  let fixture: ComponentFixture<SettingMenue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingMenue]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingMenue);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
