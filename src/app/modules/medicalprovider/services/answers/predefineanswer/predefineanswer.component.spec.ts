import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredefineanswerComponent } from './predefineanswer.component';

describe('PredefineanswerComponent', () => {
  let component: PredefineanswerComponent;
  let fixture: ComponentFixture<PredefineanswerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PredefineanswerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PredefineanswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
