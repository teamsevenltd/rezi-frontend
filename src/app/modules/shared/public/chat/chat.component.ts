import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GeneralServiceService } from '../../../../services/general-service.service';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit {
  chatForm!: FormGroup;

  client_info: any;
  getLoader = false;
  submitted = false;

  url: any = [];
  chat_details: any = [];
  patient_id: any;
  patient_details: any;

  selectedLang: string = '';

  smileys = [
    { icon: '😡', label: 'Angry' },
    { icon: '😕', label: 'Sad' },
    { icon: '😐', label: 'Neutral' },
    { icon: '😊', label: 'Happy' },
    { icon: '😍', label: 'Excellent' },
  ];

  predefinedServices: any = {
    termin: {
      en: 'Appointment Service',
      de: 'Termin Standardeinstellung'
    }
  };

  constructor(private route: ActivatedRoute, private auth: AuthService, private fb: FormBuilder, private shared: GeneralServiceService, private cdr: ChangeDetectorRef) {
    this.shared.userLanguage$.subscribe((lang: string) => {
      this.selectedLang = lang.replace(/"/g, '');
      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    let lang = localStorage.getItem('user_lang') || 'de';
    this.selectedLang = lang.replace(/"/g, '');

    this.chatForm = this.fb.group({
      facility_id: [''],
      request_id: [''],
      from: [''],
      to: [''],
      message: ['', Validators.required],
    })
    this.url = this.route.snapshot?.url;

    this.patient_id = this.route.snapshot?.queryParams['patient_id'];
    let info = JSON.parse(localStorage.getItem('info') || '{}');
    if (this.patient_id || Object.keys(info).length > 0) {
      this.client_info = info;
      this.getRequest(this.url[2]?.path);
    }
    if (this.patient_id) {
      this.getUserDetail();
    }
    // if (Object.keys(info).length === 0) {
    //   return;
    // }
    // else {
    //   this.client_info = info;
    //   this.getRequest(this.url[2]?.path);
    // }
  }

  getUserDetail() {
    this.auth.get('patient/public/' + this.patient_id).subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.patient_details = res.data;
        }
      },
      error: (err) => {

      }
    })
  }

  getRequest(id: any) {
    this.getLoader = true;
    this.auth.get('chat/' + id).subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.getLoader = false;
          this.chat_details = res.data?.data;
        }
      },
      error: (err) => {
        this.getLoader = false;
      }
    })
  }

  getServiceName(item: any): string {
    if (this.predefinedServices[item.service_name]) {
      return this.predefinedServices[item.service_name][this.selectedLang] || item.service_name;
    }
    return item?.service_name;
  }

  sendMessage() {
    this.submitted = true;
    this.chatForm.patchValue({
      facility_id: this.url[1]?.path,
      request_id: this.url[2]?.path,
      from: this.patient_id,
      to: this.url[1]?.path,
    });
    this.auth.post('chat/public', this.chatForm.value).subscribe({
      next: (res: any) => {
        if (res.status == 201) {
          this.shared.showAlert('success', 'Successful', res.message);
          this.chatForm.patchValue({ message: '' });
          this.submitted = false;
        }
        this.getRequest(this.url[2]?.path);
      },
      error: (err) => {
        this.shared.showAlert('error', 'Error', err.error.message);
        this.submitted = false;
      }
    })
  }

  requestStatus(id: any, status: string) {
    this.auth.patch('appointment/status', { id: id, status: status }).subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.shared.showAlert('success', 'Successful', res.message);
          this.getRequest(this.url[2]?.path);
        }
      },
      error: (err) => {
        this.shared.showAlert('error', 'Error', err.error.message);
      }
    })
  }

  getIconForValue(value: string) {
    const match = this.smileys.find(s => s.label === value);
    return match ? match.icon : '';
  }
}
