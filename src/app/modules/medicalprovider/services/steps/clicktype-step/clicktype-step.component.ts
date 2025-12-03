import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-clicktype-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './clicktype-step.component.html',
  styleUrl: './clicktype-step.component.scss'
})
export class ClicktypeStepComponent implements OnInit {
  @Input() step_details: any;
  clickForm!: FormGroup;

  selected_lang: string = '';

  // action_list = [
  //   { label: 'Continue to the next step in appointment process', value: '' },
  //   { label: 'Patients will receive an automatic message', value: 'patients will receive an automatic message' },
  //   { label: 'Patients will be directed to external service', value: 'Patients will be directed to external service' },
  //   { label: 'An external service is displayed to patients', value: 'an external service is displayed to patients' },
  // ]
  constructor(private fb: FormBuilder, private auth: AuthService) {
    let lang = localStorage.getItem('system_lang');
    this.selected_lang = lang ? lang : 'de';
  }

  ngOnInit(): void {
    console.log(this.step_details);

    this.clickForm = this.fb.group({
      id: [''],
      service_id: [''],
      step_type: [''],
      action_type: [''],
      action_value: ['']
    });
  }

  onChoose() {
    this.clickForm.patchValue({ action_value: '' });
  }

  saveForm() {
    this.clickForm.patchValue({ id: this.step_details?._id, service_id: this.step_details?.service_id, step_type: 'click' })
    this.auth.post('step', this.clickForm.value).subscribe({
      next: (res: any) => {
        if (res.status == 201) {
          console.log(res);

        }
      },
      error: (err) => {

      }
    })

  }
}
