import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../../auth/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-insurancetype-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './insurancetype-step.component.html',
  styleUrl: './insurancetype-step.component.scss'
})
export class InsurancetypeStepComponent implements OnInit {
  @Input() step_details: any;

  insuranceForm!: FormGroup;

  // action_list = [
  //   { label: 'Continue to the next step in appointment process', value: '' },
  //   { label: 'Patients will receive an automatic message', value: 'patients will receive an automatic message' },
  //   { label: 'Patients will be directed to external service', value: 'Patients will be directed to external service' },
  //   { label: 'An external service is displayed to patients', value: 'an external service is displayed to patients' },
  // ]
  constructor(private fb: FormBuilder, private auth: AuthService) { }

  ngOnInit(): void {
    this.insuranceForm = this.fb.group({
      id: [this.step_details?._id],
      legal_new_patient_action_type: [''],
      legal_new_patient_action_value: [''],
      legal_old_patient_action_type: [''],
      legal_old_patient_action_value: [''],
      private_new_patient_action_type: [''],
      private_new_patient_action_value: [''],
      private_old_patient_action_type: [''],
      private_old_patient_action_value: [''],
      self_new_patient_action_type: [''],
      self_new_patient_action_value: [''],
      self_old_patient_action_type: [''],
      self_old_patient_action_value: [''],
      show_insurance: false
    })
  }
}
