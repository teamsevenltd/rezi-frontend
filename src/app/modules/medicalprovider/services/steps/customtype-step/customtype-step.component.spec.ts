import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomtypeStepComponent } from './customtype-step.component';

describe('CustomtypeStepComponent', () => {
  let component: CustomtypeStepComponent;
  let fixture: ComponentFixture<CustomtypeStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomtypeStepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomtypeStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
