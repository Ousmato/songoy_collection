import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandeAccepter } from './commande-accepter';

describe('CommandeAccepter', () => {
  let component: CommandeAccepter;
  let fixture: ComponentFixture<CommandeAccepter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandeAccepter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommandeAccepter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
