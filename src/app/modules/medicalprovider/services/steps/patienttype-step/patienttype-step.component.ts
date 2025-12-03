import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-patienttype-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './patienttype-step.component.html',
  styleUrl: './patienttype-step.component.scss'
})
export class PatienttypeStepComponent implements OnInit {
  @Input() step_details: any;
  patientForm!: FormGroup;

  // action_list = [
  //   { label: 'Continue to the next step in appointment process', value: '' },
  //   { label: 'Patients will receive an automatic message', value: 'patients will receive an automatic message' },
  //   { label: 'Patients will be directed to external service', value: 'Patients will be directed to external service' },
  //   { label: 'An external service is displayed to patients', value: 'an external service is displayed to patients' },
  // ]
  constructor(private fb: FormBuilder, private auth: AuthService) { }

  ngOnInit(): void {
    this.patientForm = this.fb.group({
      id: [this.step_details?._id],
      new_patient_action_type: [''],
      new_patient_action_value: [''],
      old_patient_action_type: [''],
      old_patient_action_value: [''],
    })
  }

}
