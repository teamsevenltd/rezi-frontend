import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatienttypeStepComponent } from './patienttype-step.component';

describe('PatienttypeStepComponent', () => {
  let component: PatienttypeStepComponent;
  let fixture: ComponentFixture<PatienttypeStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatienttypeStepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatienttypeStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
