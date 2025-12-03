import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsurancetypeStepComponent } from './insurancetype-step.component';

describe('InsurancetypeStepComponent', () => {
  let component: InsurancetypeStepComponent;
  let fixture: ComponentFixture<InsurancetypeStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsurancetypeStepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsurancetypeStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
