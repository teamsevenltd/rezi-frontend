import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { GeneralServiceService } from '../../../../services/general-service.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss',
})
export class InfoComponent implements OnInit {
  infoForm!: FormGroup;
  @Input() steps: any[] = [];
  @Input() counter: number = 1;
  @Input() allowAutoSkip = false;
  @Input() isLastStep = false;
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
    });

    const hasCompleteInfo = this.hasCompleteClientInfo(client_info);

    //Info already filled - auto-skip
    if (this.allowAutoSkip && hasCompleteInfo) {
      setTimeout(() => {
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

  getTabName(name: string) {
    this.shared.getTab(name);
  }
}
