import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubpredefineanswerComponent } from './subpredefineanswer.component';

describe('SubpredefineanswerComponent', () => {
  let component: SubpredefineanswerComponent;
  let fixture: ComponentFixture<SubpredefineanswerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubpredefineanswerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubpredefineanswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
