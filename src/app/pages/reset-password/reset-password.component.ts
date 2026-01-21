import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { Customvalidators } from '../../services/custom-validators.service';
import { GeneralServiceService } from '../../services/general-service.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterLink, FormsModule, ReactiveFormsModule, CommonModule, TranslateModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  resetForm!: FormGroup;

  loading = false;
  submitted = false;

  hidePassword = false;
  hideconfPassword = false;

  auth_token: any;

  selectedLang: string = 'en';

  constructor(private formBuilder: FormBuilder, private auth: AuthService, private router: Router, private route: ActivatedRoute, private shared: GeneralServiceService, private translate: TranslateService) { }

  ngOnInit(): void {
    this.auth_token = this.route.snapshot?.queryParams['key'];
    this.resetForm = this.formBuilder.group({
      token: [''],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      confpass: ['', Validators.required],
    }, {
      validator: Customvalidators('new_password', 'confpass')
    });
  }

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfPassword() {
    this.hideconfPassword = !this.hideconfPassword;
  }

  submitForm() {
    this.resetForm.patchValue({ token: this.auth_token });
    this.loading = true;
    this.submitted = true;
    if (this.resetForm.invalid) {
      this.loading = false;
    }
    else {
      this.auth.post('user/resetpassword', this.resetForm.value).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.loading = false;
            this.resetForm.reset();
            const translatedMsg = this.translate.instant('responses.password_reset_successfully');
            this.shared.showAlert('success', 'Successful', translatedMsg);
            this.submitted = false;
            setTimeout(() => {
              window.close();
            }, 1000);
          }
        },
        error: (err) => {
          let errorTranslateMsg;
          this.loading = false;
          this.submitted = false;
          if (err.error.status == 403) {
            errorTranslateMsg = this.translate.instant('responses.enter_new_password');
          } else if (err.error.status == 404) {
            errorTranslateMsg = this.translate.instant('responses.user_not_found');
          } else {
            errorTranslateMsg = err.error.message
          }
          this.shared.showAlert('error', 'Error', errorTranslateMsg);
        }
      })
    }
  }

  get error(): { [key: string]: AbstractControl } {
    return this.resetForm.controls;
  }

  switchLanguage(lang: string) {
    this.selectedLang = lang;
    this.shared.setLanguage(lang);
    this.translate.use(lang);
    localStorage.setItem('system_lang', JSON.stringify(lang));
  }
}
