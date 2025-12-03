import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, EventEmitter, Input, OnDestroy, OnInit, Output, viewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../../auth/auth.service';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { GeneralServiceService } from '../../../../../services/general-service.service';
import { take } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-customtype-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './customtype-step.component.html',
  styleUrl: './customtype-step.component.scss'
})
export class CustomtypeStepComponent implements OnInit, OnDestroy {
  @Input() step_details: any;
  @Input() step_arr: any;
  @Output() updateSteps = new EventEmitter<any>();
  @Output() deleteStep = new EventEmitter<string>();

  customForm!: FormGroup;
  stepForm!: FormGroup;
  private stepSubscription!: Subscription;

  loading = false;
  submitted = false;

  step_loading = false;

  id = '';
  location_arr: any = [];
  // isFile = false;
  file: any;

  junctionTypes = [
    { label: 'junctionTypes.text', value: 'text' },
    { label: 'junctionTypes.answers', value: 'answers' },
    { label: 'junctionTypes.multi_answers', value: 'multi_answers' },
    { label: 'junctionTypes.slider_small', value: 'slider_small' },
    { label: 'junctionTypes.slider_large', value: 'slider_large' },
    { label: 'junctionTypes.slider_emotion', value: 'slider_emotion' },
    { label: 'junctionTypes.slider_consent', value: 'slider_consent' },
    { label: 'junctionTypes.external_link', value: 'external_link' },
    { label: 'junctionTypes.upload', value: 'upload' },
    { label: 'junctionTypes.download_no_confirmation', value: 'download_no_confirmation' },
    { label: 'junctionTypes.download_confirmation', value: 'download_confirmation' },
    { label: 'junctionTypes.content_no_confirmation', value: 'content_no_confirmation' },
    { label: 'junctionTypes.content_confirmation', value: 'content_confirmation' },
    { label: 'junctionTypes.video', value: 'video' },
    // { label: 'junctionTypes.video_no_button', value: 'video_no_button' },
    // { label: 'junctionTypes.video_with_actions', value: 'video_with_actions' },
    { label: 'junctionTypes.signature', value: 'signature' },
  ];

  @ViewChild('closeCustomModal') closeCustomModal!: ElementRef;

  constructor(private fb: FormBuilder, private auth: AuthService, private shared: GeneralServiceService) { }

  ngOnInit(): void {
    this.id = this.step_details?._id;
    this.customForm = this.fb.group({
      id: [''],
      service_id: [''],
      prev_step_id: [''],
      step_description: [this.step_details?.step_description || ''],
    });
    this.resetEditForm();

    this.customForm.valueChanges.pipe(debounceTime(1000), distinctUntilChanged()).subscribe(() => {
      this.addStepTitle()
    });
    this.stepSubscription = this.shared.addStep$.pipe(take(1)).subscribe(() => {
      this.addStepsRow();
    });
  }

  ngOnDestroy(): void {
    this.stepSubscription?.unsubscribe();
  }

  addStepTitle() {
    this.customForm.patchValue({ id: this.step_details?._id }, { emitEvent: false });
    this.auth.patch('step', this.customForm.value).subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.updateSteps.emit(true);
        }
      },
      error: (err) => {
        this.shared.showAlert('error', 'Error', err.error.message);
      }
    })
  }

  addStepsRow(): void {
    let custom_arr = this.step_arr.filter((step: { step_type: string; }) => step?.step_type === 'custom');
    this.step_details = custom_arr[custom_arr.length - 1];
    this.customForm.patchValue({ service_id: this.step_details?.service_id, prev_step_id: this.step_details?._id, step_description: this.step_details?.step_description });
    this.auth.post('step', this.customForm.value).subscribe({
      next: (res: any) => {
        if (res.status == 201) {
          this.updateSteps.emit(true);
        }
      },
      error: (err) => {
        this.shared.showAlert('error', 'Error', err.error.message);
      }
    })
  }

  deleteStepsRow() {
    this.deleteStep.emit(this.step_details._id);
  }

  getLocation() {
    this.loading = true;
    this.auth.get('location').subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.loading = false;
          this.location_arr = res.data?.data;
        }
      },
      error: (err) => {
        this.loading = false;
      }
    })
  }

  selectJunction(event: any) {
    if (event.target.value !== 'answers' && event.target.value !== 'multi_answers') {
      let answerArray = this.stepForm.get('answers') as FormArray;
      answerArray.clear();
    }
  }

  get answers() {
    return this.stepForm.get('answers') as FormArray;
  }

  createAnswer(): FormGroup {
    return this.fb.group({
      answer_text: ['']
    });
  }

  addAnswer() {
    this.answers.push(this.createAnswer());
  }

  removeAnswer(index: number) {
    this.answers.removeAt(index);
  }

  submitCustomStep() {
    this.loading = true;
    this.submitted = true;
    if (this.stepForm.invalid) {
      this.loading = false;
    }
    else {
      this.auth.patch('step', this.stepForm.value).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.loading = false;
            this.closeCustomModal.nativeElement.click();
            this.stepForm.reset();
            this.shared.showAlert('success', 'Successful', res.message);
            this.submitted = false;
          }
          this.updateSteps.emit(true);
        },
        error: (err) => {
          this.loading = false;
          this.submitted = false;
          this.shared.showAlert('error', 'Error', err.error.message);
        }
      })
    }
  }

  editCustomStep() {
    this.stepForm.patchValue({
      id: this.step_details?._id,
      junction_type: this.step_details?.step_meta?.junction_type || 'text',
      media: this.step_details?.step_meta?.media,
      all_patient: this.step_details?.step_meta?.all_patient,
      new_statutory_health_insurance: this.step_details?.step_meta?.new_statutory_health_insurance,
      old_statutory_health_insurance: this.step_details?.step_meta?.old_statutory_health_insurance,
      new_private_health_insurance: this.step_details?.step_meta?.new_private_health_insurance,
      old_private_health_insurance: this.step_details?.step_meta?.old_private_health_insurance,
      new_self_insurance: this.step_details?.step_meta?.new_self_insurance,
      old_self_insurance: this.step_details?.step_meta?.old_self_insurance,
      new_bg_insurance: this.step_details?.step_meta?.new_bg_insurance,
      old_bg_insurance: this.step_details?.step_meta?.old_bg_insurance
    });
  }

  resetEditForm() {
    this.stepForm = this.fb.group({
      id: ['', Validators.required],
      junction_type: ['text', Validators.required],
      media: [''],
      answers: this.fb.array([this.createAnswer()]),
      all_patient: [true],
      new_statutory_health_insurance: [true],
      old_statutory_health_insurance: [true],
      new_private_health_insurance: [true],
      old_private_health_insurance: [true],
      new_self_insurance: [true],
      old_self_insurance: [true],
      new_bg_insurance: [true],
      old_bg_insurance: [true],
    });
    let answerArray = this.stepForm.get('answers') as FormArray;
    answerArray.clear();
    let predefined = this.step_details?.step_meta?.predefine_answers;
    for (let x = 0; x < predefined?.length; x++) {
      answerArray.push(this.fb.group({ answer_text: predefined[x]?.answer_text }));
    }
  }
}