import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppfooterComponent } from './appfooter.component';

describe('AppfooterComponent', () => {
  let component: AppfooterComponent;
  let fixture: ComponentFixture<AppfooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppfooterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppfooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
