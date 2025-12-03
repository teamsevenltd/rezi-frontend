import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Customvalidators } from '../../services/custom-validators.service';
import { GeneralServiceService } from '../../services/general-service.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, TranslateModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  submitted = false;
  loading = false;

  hidePassword = false;
  hideconfPassword = false;

  selectedLang: string = 'en';

  constructor(private fb: FormBuilder, private auth: AuthService, private shared: GeneralServiceService, private router: Router, private translate: TranslateService) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      title: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confpass: ['', [Validators.required]],
      phone_number: [''],
    },
      {
        validator: Customvalidators("password", "confpass")
      });

    const savedLang = JSON.parse(localStorage.getItem('system_lang') || '"en"');
    this.selectedLang = savedLang;
  }

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }
  toggleConfPassword() {
    this.hideconfPassword = !this.hideconfPassword;
  }

  submitForm() {
    this.submitted = true;
    this.loading = true;
    if (this.registerForm.invalid) {
      this.loading = false;
    }
    else {
      this.auth.post('signup', this.registerForm.value).subscribe({
        next: (res: any) => {
          if (res.status == 201) {
            this.loading = false;
            this.registerForm.reset();
            localStorage.setItem('authtoken', JSON.stringify(res?.token));
            localStorage.setItem('userdata', JSON.stringify(res.data));
            this.auth.setLoginStatus(true);
            this.auth.setuserRole(res.data?.role_id?.key)
            this.submitted = false;
          }
          if (this.auth.isLogin()) {
            if (this.auth.userRole() == res.data?.role_id?.key) {
              this.router.navigate([res.data?.role_id?.key + '/subscription']);
            }
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
    return this.registerForm.controls;
  }

  switchLanguage(lang: string) {
    this.selectedLang = lang;
    this.shared.setLanguage(lang);
    this.translate.use(lang);
    localStorage.setItem('system_lang', JSON.stringify(lang));
  }
}
