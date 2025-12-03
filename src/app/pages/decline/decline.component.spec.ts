import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeclineComponent } from './decline.component';

describe('DeclineComponent', () => {
  let component: DeclineComponent;
  let fixture: ComponentFixture<DeclineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeclineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeclineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
