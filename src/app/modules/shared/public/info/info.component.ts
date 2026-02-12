import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { GeneralServiceService } from '../../../../services/general-service.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss',
})
export class InfoComponent implements OnInit {
  service_name: string = '';
  otp_array = new Array(4);

  infoForm!: FormGroup;
  @Input() steps: any[] = [];
  @Input() counter: number = 1;
  @Input() allowAutoSkip = false;
  @Input() isLastStep = false;
  @Output() updateTab = new EventEmitter<any>();
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  @ViewChild('closeVerifyModal') closeVerifyModal!: ElementRef;

  constructor(private fb: FormBuilder, private auth: AuthService, private shared: GeneralServiceService, private translate: TranslateService) {
    this.service_name = localStorage.getItem('service_name') || '';
  }

  ngOnInit(): void {
    let client_info = JSON.parse(localStorage.getItem('info') || '{}');

    this.infoForm = this.fb.group({
      first_name: [client_info?.first_name],
      last_name: [client_info?.last_name],
      date_of_birth: [client_info?.date_of_birth],
      phone: [client_info?.phone, Validators.required],
      email: [client_info?.email, [Validators.required, Validators.email]],
    });

    const hasCompleteInfo = this.hasCompleteClientInfo(client_info);

    //Info already filled - auto-skip
    if (this.allowAutoSkip && hasCompleteInfo) {
      setTimeout(() => {
        if (this.service_name == 'meine Termine' || this.service_name === 'Meine Termine') {
          const info = JSON.parse(localStorage.getItem('info') || '{}');
          if (info.twilio_verified === true) {
            this.shared.updateStep({
              previous: 'Service',
              next: 'Appointments',
              isExternalLink: false,
            });
            this.updateTab.emit(true);
          } else {
            this.sendVerificationCode();
          }
          return;
        }

        const isExternalLink = this.checkIfNextStepIsExternalLink();

        if (this.isLastStep && isExternalLink) {
          this.openExternalLink();
          this.shared.updateStep({
            previous: 'Departments',
            next: 'Service'
          });
          this.shared.getTab('menu', { goToService: true });
        } else {
          this.shared.updateStep({
            previous: 'Service',
            next: 'Steps',
            isExternalLink: isExternalLink,
          });
          this.updateTab.emit({ shouldIncrementCounter: !this.isLastStep && isExternalLink });
          if (isExternalLink) {
            this.openExternalLink();
          }
        }
      });
    }
  }

  hasCompleteClientInfo(client_info: any): boolean {
    return !!(client_info?.phone && client_info?.email);
  }

  checkIfNextStepIsExternalLink(): boolean {
    if (this.steps && this.steps.length > 0) {
      const firstStep = this.steps[this.counter - 1];
      return (
        firstStep?.step_type === 'custom' &&
        firstStep?.step_meta?.junction_type === 'external_link'
      );
    }
    return false;
  }

  openExternalLink(): void {
    if (this.steps && this.steps.length > 0) {
      const firstStep = this.steps[this.counter - 1];
      if (
        firstStep?.step_type === 'custom' &&
        firstStep?.step_meta?.junction_type === 'external_link' &&
        firstStep?.step_meta?.media
      ) {
        const url = firstStep.step_meta.media;
        window.open(url, '_blank');
      }
    }
  }

  reset() {
    this.infoForm.reset();
  }

  submitForm() {
    if (this.infoForm.invalid) {
      return;
    } else if (this.service_name == 'meine Termine' || this.service_name === 'Meine Termine') {
      this.sendVerificationCode();
      return;
    } else {
      localStorage.setItem('info', JSON.stringify(this.infoForm.value));

      const isExternalLink = this.checkIfNextStepIsExternalLink();
      if (this.isLastStep && isExternalLink) {
        this.openExternalLink();
        this.shared.updateStep({
          previous: 'Departments',
          next: 'Service'
        });
        this.shared.getTab('menu', { goToService: true });
      } else {
        this.shared.updateStep({
          previous: 'Service',
          next: 'Steps',
          isExternalLink: isExternalLink,
        });
        this.updateTab.emit({ shouldIncrementCounter: !this.isLastStep && isExternalLink });
        if (isExternalLink) {
          this.openExternalLink();
        }
      }
    }
  }

  sendVerificationCode() {
    let phone = this.infoForm.value?.phone;
    if (phone) {
      this.auth.post('sendCode', { phone_number: phone }).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            localStorage.setItem('info', JSON.stringify(this.infoForm.value));
            const translatedMsg = this.translate.instant('responses.verification_code_sent_successfully');
            this.shared.showAlert('success', '', translatedMsg);
            const modal = new (window as any).bootstrap.Modal(document.getElementById('verifyTwilioCode'));
            modal.show();
          }
        },
        error: (err) => {
          const translatedErrorMsg = this.translate.instant('responses.failed_to_send_verification_code');
          this.shared.showAlert('error', '', translatedErrorMsg);
        }
      })
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

  verifyOTP() {
    const info = JSON.parse(localStorage.getItem('info') || '');
    const myKey = JSON.parse(localStorage.getItem('myKey') || '{}');
    const facilityId = myKey.facilityId || '';
    const otpString = this.otp_array.join('');

    if (info) {
      this.auth.post('verifyCode', {
        phone_number: info.phone,
        code: otpString
      }).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            let verifiedFacilities = JSON.parse(localStorage.getItem('twilio_verified_facilities') || '{}');

            if (!verifiedFacilities[info.phone]) {
              verifiedFacilities[info.phone] = [];
            }
            if (!verifiedFacilities[info.phone].includes(facilityId)) {
              verifiedFacilities[info.phone].push(facilityId);
            }

            localStorage.setItem('twilio_verified_facilities', JSON.stringify(verifiedFacilities));

            const translatedMsg = this.translate.instant('responses.phone_number_verified_successfully');
            this.shared.showAlert('success', '', translatedMsg);
            this.closeVerifyModal.nativeElement.click();
            this.shared.updateStep({
              previous: 'Service',
              next: 'Appointments',
              isExternalLink: false,
            });
            this.updateTab.emit(true);
          }
        },
        error: (err) => {
          const translatedErrorMsg = this.translate.instant('responses.cannot_verify_the_code');
          this.shared.showAlert('error', '', translatedErrorMsg);
        }
      })
    }
  }

  getTabName(name: string) {
    this.shared.getTab(name);
  }
}
