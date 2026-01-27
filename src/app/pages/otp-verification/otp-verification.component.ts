import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './../../auth/auth.service';
import { GeneralServiceService } from '../../services/general-service.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface AuthResponse {
  token?: string;
  message?: string;
  success?: boolean;
}

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './otp-verification.component.html',
  styleUrls: ['./otp-verification.component.scss'],
})
export class OTPVerificationComponent implements OnInit, AfterViewInit, OnDestroy {
  otpForm!: FormGroup;
  otp_array = new Array(6);

  loading = false;
  url_token: any;

  selectedLang: string = '';

  // timerValue = 60;
  // timerExpired = false;
  // timerSubscription!: Subscription;

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private shared: GeneralServiceService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.url_token = this.route.snapshot?.queryParams['token'];
    this.otpForm = this.fb.group({
      token: [''],
      otp: ['']
    });

    const savedLang = JSON.parse(localStorage.getItem('system_lang') || '"de"');
    this.switchLanguage(savedLang)
    // this.startTimer();
  }
  ngOnDestroy() {
    // this.timerSubscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    if (this.otpInputs) {
      this.resetOTPFields();
    }
  }

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (/^[0-9a-zA-Z]$/.test(value)) {
      this.otp_array[index] = value;
      if (index < this.otp_array.length - 1) {
        this.otpInputs.toArray()[index + 1].nativeElement.focus();
      }
    } else {
      input.value = '';
      this.otp_array[index] = '';
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace' || event.key === 'Delete') {
      this.otp_array[index] = '';
      input.value = '';

      if (event.key === 'Backspace' && index > 0) {
        setTimeout(() => {
          this.otpInputs.toArray()[index - 1].nativeElement.focus();
        });
      }
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const chars = pastedData.slice(0, 6).split('');

    chars.forEach((char, idx) => {
      if (/^[0-9a-zA-Z]$/.test(char)) {
        this.otp_array[idx] = char;
        const inputs = this.otpInputs.toArray();
        inputs[idx].nativeElement.value = char;
      }
    });

    const nextInput = this.otpInputs.toArray()[chars.length] || null;
    if (nextInput) nextInput.nativeElement.focus();
  }

  // startTimer() {
  //   this.timerExpired = false;
  //   this.timerValue = 60;
  //   this.timerSubscription = interval(1000).subscribe(() => {
  //     this.timerValue--;
  //     if (this.timerValue <= 0) {
  //       this.timerExpired = true;
  //     }
  //   });
  // }

  // formatTime(seconds: number): string {
  //   const min = Math.floor(seconds / 60);
  //   const sec = seconds % 60;
  //   return `${min.toString().padStart(2, '0')}:${sec
  //     .toString()
  //     .padStart(2, '0')}`;
  // }

  resetOTPFields() {
    this.otp_array = Array(6).fill('');
    this.otpInputs.forEach(input => input.nativeElement.value = '');
    const first = this.otpInputs.first;
    if (first) first.nativeElement.focus();
  }

  onSubmit(): void {
    let token;
    this.loading = true;
    if (this.otpForm.invalid) return;
    if (localStorage.getItem('two_fa_token')) {
      token = localStorage.getItem('two_fa_token');
    }
    const otpString = this.otp_array.join('');
    this.otpForm.patchValue({ token: token, otp: otpString });
    this.auth.post('loginOtp', this.otpForm.value).subscribe({
      next: (res: any) => {
        if (res.status == 201) {
          this.loading = false;
          localStorage.removeItem('two_fa_token');
          localStorage.setItem('authtoken', JSON.stringify(res?.token));
          localStorage.setItem('userdata', JSON.stringify(res.data));
          this.auth.setLoginStatus(true);
          this.auth.setuserRole(res.data?.role_id?.key);
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
        const errorTranslatedMsg = this.translate.instant('responses.invalid_otp_error');
        this.shared.showAlert('error', 'Error', errorTranslatedMsg);
        this.resetOTPFields();
      },
    });
  }

  switchLanguage(lang: string) {
    this.selectedLang = lang;
    this.shared.setLanguage(lang);
    this.translate.use(lang);
    localStorage.setItem('system_lang', JSON.stringify(lang));
  }

}
