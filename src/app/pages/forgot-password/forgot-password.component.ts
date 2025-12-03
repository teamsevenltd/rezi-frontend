import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { GeneralServiceService } from '../../services/general-service.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, FormsModule, ReactiveFormsModule, CommonModule, TranslateModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnInit {
  passwordForm!: FormGroup;

  loading = false;
  submitted = false;

  selectedLang: string = 'en';

  constructor(private fb: FormBuilder, private auth: AuthService, private shared: GeneralServiceService, private router: Router, private translate: TranslateService) { }

  ngOnInit(): void {
    this.passwordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    const savedLang = JSON.parse(localStorage.getItem('system_lang') || '"en"');
    this.selectedLang = savedLang;
  }

  submitForm() {
    this.loading = true;
    this.submitted = true;
    if (this.passwordForm.invalid) {
      this.loading = false;
    }
    else {
      this.auth.post('user/forgotPassword', this.passwordForm.value).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.loading = false;
            this.passwordForm.reset();
            this.shared.showAlert('success', 'Successful', res.message);
            this.submitted = false;
            this.router.navigate(['/']);
          }
        },
        error: (err) => {
          this.loading = false;
          this.submitted = false;
          this.shared.showAlert('error', 'Error', err.error.message);
        }
      })
    }
  }

  get error(): { [key: string]: AbstractControl } {
    return this.passwordForm.controls;
  }

  switchLanguage(lang: string) {
    this.selectedLang = lang;
    this.shared.setLanguage(lang);
    this.translate.use(lang);
    localStorage.setItem('system_lang', JSON.stringify(lang));
  }
}
