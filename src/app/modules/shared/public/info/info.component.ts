import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GeneralServiceService } from '../../../../services/general-service.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss'
})
export class InfoComponent implements OnInit {
  infoForm!: FormGroup;
  @Output() updateTab = new EventEmitter<any>();

  constructor(private fb: FormBuilder, private shared: GeneralServiceService) { }

  ngOnInit(): void {
    let client_info = JSON.parse(localStorage.getItem('info') || '{}');
    this.infoForm = this.fb.group({
      first_name: [client_info?.first_name],
      last_name: [client_info?.last_name],
      date_of_birth: [client_info?.date_of_birth],
      phone: [client_info?.phone, Validators.required],
      email: [client_info?.email, [Validators.required, Validators.email]],
    })
  }

  reset() {
    this.infoForm.reset();
  }

  submitForm() {
    if (this.infoForm.invalid) {
      return;
    }
    else {
      localStorage.setItem('info', JSON.stringify(this.infoForm.value));
      this.shared.updateStep({ previous: 'Service', next: 'Steps' });
      this.updateTab.emit(true);
    }
  }

}
