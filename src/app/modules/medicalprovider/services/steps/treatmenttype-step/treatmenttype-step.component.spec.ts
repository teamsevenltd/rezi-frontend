import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmenttypeStepComponent } from './treatmenttype-step.component';

describe('TreatmenttypeStepComponent', () => {
  let component: TreatmenttypeStepComponent;
  let fixture: ComponentFixture<TreatmenttypeStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreatmenttypeStepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreatmenttypeStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
