import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { GeneralServiceService } from '../../services/general-service.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, RouterModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  submitted = false;
  loading = false;
  hidePassword = false;

  selectedLang: string = 'en';

  constructor(private fb: FormBuilder, private auth: AuthService, private shared: GeneralServiceService, private router: Router, private translate: TranslateService) { }

  ngOnInit(): void {
    let user = JSON.parse(localStorage.getItem('userdata') || '{}');
    if (this.auth.isLogin()) {
      if (this.auth.userRole() == user?.role_id?.key) {
        if (this.auth.userRole() == 'medicalprovider') {
          if (user?.subscription?.status) {
            this.router.navigate(['/' + user?.role_id?.key])
          }
          else {
            this.router.navigate(['/' + user?.role_id?.key + '/subscription']);
          }
        }
        else {
          this.router.navigate(['/' + user?.role_id?.key]);
        }
      }
    }
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
    
    const savedLang = JSON.parse(localStorage.getItem('system_lang') || '"en"');
    this.selectedLang = savedLang;
  }

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  submitForm() {
    this.submitted = true;
    this.loading = true;
    if (this.loginForm.invalid) {
      this.loading = false;
    }
    else {
      this.auth.post('login', this.loginForm.value).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.loading = false;
            localStorage.clear();
            this.loginForm.reset();
            localStorage.setItem('authtoken', JSON.stringify(res?.token));
            localStorage.setItem('userdata', JSON.stringify(res.data));
            this.auth.setLoginStatus(true);
            this.auth.setuserRole(res.data?.role_id?.key);
            this.submitted = false;
          }
          if (this.auth.isLogin()) {
            if (this.auth.userRole() == res.data?.role_id?.key) {
              if (this.auth.userRole() == 'medicalprovider') {
                if (res.data?.subscription?.status) {
                  this.router.navigate(['/' + res.data?.role_id?.key])
                }
                else {
                  this.router.navigate(['/' + res.data?.role_id?.key + '/subscription']);
                }
              }
              else {
                this.router.navigate(['/' + res.data?.role_id?.key]);
              }
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
    return this.loginForm.controls;
  }

  switchLanguage(lang: string) {
    this.selectedLang = lang;
    this.shared.setLanguage(lang);
    this.translate.use(lang);
    localStorage.setItem('system_lang', JSON.stringify(lang));
  }

}
