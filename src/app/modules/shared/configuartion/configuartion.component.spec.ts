import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguartionComponent } from './configuartion.component';

describe('ConfiguartionComponent', () => {
  let component: ConfiguartionComponent;
  let fixture: ComponentFixture<ConfiguartionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguartionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfiguartionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
