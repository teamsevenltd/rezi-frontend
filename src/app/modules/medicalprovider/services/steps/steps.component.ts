import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CdkDropList, CdkDrag, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import Swal from 'sweetalert2';


import { GeneralServiceService } from '../../../../services/general-service.service';
import { ClicktypeStepComponent } from "./clicktype-step/clicktype-step.component";
import { InsurancetypeStepComponent } from "./insurancetype-step/insurancetype-step.component";
import { PatienttypeStepComponent } from "./patienttype-step/patienttype-step.component";
import { CustomtypeStepComponent } from "./customtype-step/customtype-step.component";
import { TreatmenttypeStepComponent } from './treatmenttype-step/treatmenttype-step.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-steps',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CdkDropList, CdkDrag, TranslateModule, ClicktypeStepComponent, InsurancetypeStepComponent, PatienttypeStepComponent, CustomtypeStepComponent, TreatmenttypeStepComponent],
  templateUrl: './steps.component.html',
  styleUrl: './steps.component.scss'
})
export class StepsComponent implements OnInit, AfterViewInit {
  stepsForm!: FormGroup;
  dragStepForm!: FormGroup;
  id: any;

  loading = false;
  submitted = false;

  step_loading = false;

  getLoader = false;
  skeleton_arr = new Array(6);

  steps_arr: any = [];
  custom_arr: any = [];

  currentLanguage: string = '';

  translations: Record<string, { de: string; en: string }> = {
    "Der Patient klickt im Online-Empfang auf den Termin-Button.": {
      de: "Der Patient klickt im Online-Empfang auf den Termin-Button.",
      en: "The patient clicks on the appointment button in the online reception."
    },
    "Der Patient wird nach neuen/bestehenden Patienten befragt.": {
      de: "Der Patient wird nach neuen/bestehenden Patienten befragt.",
      en: "The patient is asked whether they are a new or existing patient."
    },
    "Der Patient wird nach seiner Versicherung gefragt.": {
      de: "Der Patient wird nach seiner Versicherung gefragt.",
      en: "The patient is asked about their insurance."
    },
    "Der Patient wird nach den gewünschten Leistungen befragt.": {
      de: "Der Patient wird nach den gewünschten Leistungen befragt.",
      en: "The patient is asked about the desired services."
    }
  };

  @ViewChild('childRef') childComponentRef!: CustomtypeStepComponent;

  constructor(private route: ActivatedRoute, private auth: AuthService, private fb: FormBuilder, public shared: GeneralServiceService, private translate: TranslateService, private cdr: ChangeDetectorRef) {
    this.shared.language$.subscribe((lang: string) => {
      this.currentLanguage = lang.replace(/"/g, '');
      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    let lang = localStorage.getItem('system_lang') || 'de';
    this.currentLanguage = lang.replace(/"/g, '');

    this.dragStepForm = this.fb.group({
      moved_id: [''],
      mover_id: ['']
    })
    this.getStepsbyServiceId(this.id);
  }

  ngAfterViewInit() {
    // console.log('Child ref available:', this.childComponentRef);
  }

  getStepsbyServiceId(serviceId: any) {
    this.custom_arr = [];
    this.getLoader = true;
    this.auth.get('service/steps/' + serviceId).subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.getLoader = false;
          this.steps_arr = res.data;
          this.custom_arr = this.steps_arr.filter((step: { step_type: string; }) => step?.step_type === 'custom');
          // for (let i = 0; i < this.steps_arr.length; i++) {
          //   if (this.steps_arr[i]?.step_type == 'custom') {
          //     this.custom_arr.push(this.steps_arr[i]);
          //   }
          // }
        }
      },
      error: (err) => {
        this.getLoader = false;
      }
    })
  }

  getTranslatedText(germanText: string): string {
    const translation = this.translations[germanText];

    if (translation) {
      const lang = this.currentLanguage || 'de'; // fallback to 'de' if empty
      const result = translation[lang as 'de' | 'en'];
      return result;
    }

    return germanText;
  }

  addCustomStep() {
    this.step_loading = true;
    if (this.childComponentRef) {
      this.childComponentRef.addStepsRow();
    }
    // this.shared.triggerAddStep();
  }

  onUpdateSteps(event: boolean): void {
    if (event) {
      this.step_loading = false;
      this.getStepsbyServiceId(this.id);
    } else {
      this.step_loading = false;
    }
  }

  onDeleteStep(id: any) {
    Swal.fire({
      title: this.translate.instant('sweet_alert.are_you_sure'),
      text: this.translate.instant('sweet_alert.action_cannot_be_revert'),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000000",
      cancelButtonColor: "#d33",
      confirmButtonText: this.translate.instant('sweet_alert.delete'),
      cancelButtonText: this.translate.instant('sweet_alert.cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.auth.delete('step/' + id, '').subscribe({
          next: (res: any) => {
            if (res.status == 200) {
              const translatedMsg = this.translate.instant('responses.step_deleted_successfully');
              this.shared.showAlert('success', 'Successful', translatedMsg);
              this.getStepsbyServiceId(this.id);
            }
          },
          error: (err) => {
            this.shared.showAlert('error', 'Error', err.error.message);
          }
        })
      }
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    if (this.custom_arr[event.previousIndex]?._id == this.custom_arr[event.currentIndex]?._id) {
      return
    }
    else {
      this.dragStepForm.patchValue({ mover_id: this.custom_arr[event.previousIndex]?._id, moved_id: this.custom_arr[event.currentIndex]?._id })
      moveItemInArray(this.custom_arr, event.previousIndex, event.currentIndex);
      this.auth.patch('step/order', this.dragStepForm.value).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.shared.showAlert('success', 'Successful', res.message);
            this.getStepsbyServiceId(this.custom_arr[event.currentIndex]?.service_id)
          }
        },
        error: (err) => {
          this.shared.showAlert('error', 'Error', err.error.message);
        }
      })
    }
  }

}