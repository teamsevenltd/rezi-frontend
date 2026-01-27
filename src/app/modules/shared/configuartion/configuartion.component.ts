import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { GeneralServiceService } from '../../../services/general-service.service';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { DepartmentComponent } from "../../medicalprovider/department/department.component";

@Component({
  selector: 'app-configuartion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, DepartmentComponent],
  templateUrl: './configuartion.component.html',
  styleUrl: './configuartion.component.scss'
})
export class ConfiguartionComponent implements OnInit {
  configurationForm!: FormGroup;

  loading = false;
  submitted = false;

  backgroundcolor: string = '';
  textcolor: string = '';

  user_data: any;
  file: any = [];
  logo: any;
  logo_img: any;

  url: any;

  constructor(private fb: FormBuilder, public auth: AuthService, private shared: GeneralServiceService, private translate: TranslateService) { }

  ngOnInit(): void {
    const urlString = window.location.href;
    this.url = new URL(urlString);
    this.configurationForm = this.fb.group({
      action: [''],
      title: [''],
      domain: [''],
      restrict_appointments: [''],
      background_color: [''],
      text_color: [''],
      file: ['']
    });
    this.getUserData();
  }

  getUserData() {
    return new Promise((resolve) => {
      this.user_data = localStorage.getItem('userdata') ? JSON.parse(localStorage.getItem('userdata') || '{}') : '';
      this.configurationForm.reset();
      this.configurationForm.patchValue({
        title: this.user_data?.facility_id?.title,
        domain: this.url?.origin + '/public/' + this.user_data?.facility_id?._id,
        restrict_appointments: this.user_data?.facility_id?.restrict_appointments,
        background_color: this.user_data?.facility_id?.background_color || '#ffffff',
        text_color: this.user_data?.facility_id?.text_color,
        file: this.user_data?.facility_id?.site_logo
      });
      if (this.configurationForm.value?.file) {
        this.logo_img = this.configurationForm.value.file;
      }
      resolve(true);
    })
  }

  getColor(event: any, cateory: string) {
    if (cateory == 'bg') {
      this.backgroundcolor = event.target.value;
    }
    else if (cateory == 'text') {
      this.textcolor = event.target.value;
    }
  }

  submitForm() {
    if (this.configurationForm.value.restrict_appointments == null) {
      this.configurationForm.patchValue({ restrict_appointments: false })
    }
    this.configurationForm.patchValue({ background_color: this.backgroundcolor || this.configurationForm.value?.background_color, text_color: this.textcolor || this.configurationForm.value?.text_color })
    this.loading = true;
    this.submitted = true;
    if (this.configurationForm.invalid) {
      this.loading = false;
    }
    else {
      this.auth.patch('facility', this.configurationForm.value).subscribe({
        next: async (res: any) => {
          if (res.status == 200) {
            this.loading = false;
            this.configurationForm.reset();
            const translatedMsg = this.translate.instant('responses.facility_created_successfully');
            this.shared.showAlert('success', 'Successful', translatedMsg);
            this.submitted = false;
          };
          await this.auth.validateToken();
          this.getUserData();
        },
        error: (err) => {
          this.loading = false;
          this.submitted = false;
          this.shared.showAlert('error', 'Error', err.error.message);
        }
      })
    }
  }

  updateLogo(event: any) {
    this.file = event.target.files;
    if (this.file[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logo = e.target.result;
      };
      reader.readAsDataURL(this.file[0]);
    }
    let formData = new FormData()
    formData.append('file', this.file[0])
    formData.append('action', 'ChangeLogo')
    this.auth.patch('facility', formData).subscribe({
      next: async (res: any) => {
        if (res.status === 200) {
          this.shared.showAlert('success', 'Successful', res.message)
        }
        await this.auth.validateToken();
        this.getUserData();
      },
      error: (err) => {
        this.shared.showAlert('error', 'Error', err.error.message);
      }
    })
  }

  copyToClipboard(textarea: HTMLTextAreaElement): void {
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    navigator.clipboard.writeText(textarea.value).then(() => {
      this.shared.showAlert('success', '', 'Copied to clipboard!')
    }).catch(err => {
      this.shared.showAlert('warning', '', 'Failed to copy to clipboard, Try again')
    });
  }
}
