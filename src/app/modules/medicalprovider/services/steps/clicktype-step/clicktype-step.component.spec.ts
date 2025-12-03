import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClicktypeStepComponent } from './clicktype-step.component';

describe('ClicktypeStepComponent', () => {
  let component: ClicktypeStepComponent;
  let fixture: ComponentFixture<ClicktypeStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClicktypeStepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClicktypeStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
