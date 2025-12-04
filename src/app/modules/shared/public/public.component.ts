import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { GeneralServiceService } from '../../../services/general-service.service';
import {
  AngularSignaturePadModule,
  SignaturePadComponent,
} from '@almothafar/angular-signature-pad';

import { InfoComponent } from './info/info.component';
import { ChatComponent } from './chat/chat.component';
import { NewsComponent } from './news/news.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { TranslateModule } from '@ngx-translate/core';
import { CdkDropList } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-public',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AngularSignaturePadModule,
    TranslateModule,
    InfoComponent,
    ChatComponent,
    NewsComponent,
    FeedbackComponent,
    CdkDropList,
  ],
  templateUrl: './public.component.html',
  styleUrl: './public.component.scss',
})
export class PublicComponent implements OnInit {
  clientForm!: FormGroup;
  appointmentForm!: FormGroup;

  id: any;

  loading = false;
  submitted = false;

  getLoader = false;
  skeleton_arr = new Array(6);

  tab_name: string = '';

  isMenuLocation = true;
  isMenuDepartment = false;
  isMenuService = false;
  isMenuSteps = false;
  isChat = false;
  isNews = false;
  isInfo = false;

  allowInfoAutoSkip = false;

  facility_details: any;
  location_arr: any = [];
  department_arr: any = [];
  service_arr: any = [];
  steps_arr: any = [];
  treatment_arr: any = [];

  counter: number = 1;
  selectedAnswerId: any;

  selectedSmileyLabel: string = '';
  sign = '';

  consent_for_file = false;
  availability_arr: any = [];

  selectedLang: string = '';
  predefinedServices: any = {
    termin: {
      en: 'Appointment Service',
      de: 'Termin Standardeinstellung',
    },
  };

  @ViewChild('customer_signature') customer_signature!: SignaturePadComponent;

  approval = [
    { label: 'Highly Disagreed', value: 'highly_disagreed' },
    { label: 'Disagreed', value: 'disagreed' },
    { label: 'Neutral', value: 'neutral' },
    { label: 'Agreed', value: 'agreed' },
    { label: 'Highly Agreed', value: 'highly_agreed' },
  ];

  smileys = [
    { icon: '😡', label: 'Angry' },
    { icon: '😕', label: 'Sad' },
    { icon: '😐', label: 'Neutral' },
    { icon: '😊', label: 'Happy' },
    { icon: '😍', label: 'Excellent' },
  ];

  signaturePadOptions = {
    minWidth: 5,
    canvasWidth: 500,
    canvasHeight: 275,
    backgroundColor: 'white',
  };

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private shared: GeneralServiceService,
    private fb: FormBuilder,
    private router: Router,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {
    this.shared.tabsRoute$.subscribe((name: any) => {
      this.tab_name = name;
      // When navigating to menu tab, completely reset everything
      if (name === 'menu') {
        this.resetMenuState();
      }
      // When user explicitly clicks info button in footer, don't allow auto-skip
      if (name === 'info') {
        this.allowInfoAutoSkip = false;
      }
    });
    this.shared.userLanguage$.subscribe((lang: string) => {
      this.selectedLang = lang.replace(/"/g, '');
      this.cdr.detectChanges();
    });
  }

  resetMenuState() {
    // Reset to initial state - show location selection
    this.isMenuLocation = true;
    this.isMenuDepartment = false;
    this.isMenuService = false;
    this.isMenuSteps = false;

    // Reset counter to start from beginning
    this.counter = 1;
    this.customStepCounter = 0;

    // Clear selected data
    this.selected_date = null;
    this.selected_slot = null;
    this.selectedTreatments = [];
    this.treatments_time = [];
    this.total_treatment_time = null;
    this.client_type = '';
    this.selectedInsuranceType = '';
    this.selectedAnswerId = null;
    this.selectedSmileyLabel = '';

    // Reset arrays
    this.steps_arr = [];
    this.availability_arr = [];

    // Re-fetch locations to start fresh
    if (this.facility_details?._id) {
      this.getLocations(this.facility_details._id);
    }
  }

  ngOnInit(): void {
    let lang = localStorage.getItem('user_lang') || 'de';
    this.selectedLang = lang.replace(/"/g, '');

    if (this.route.snapshot?.url.length == 2) {
      this.tab_name = 'menu';
      this.id = this.route.snapshot.params['id'];
    } else {
      this.tab_name = 'chat';
      if (this.route.snapshot.url.length > 2) {
        this.id = this.route.snapshot?.url[1].path;
      } else {
        this.id = this.route.snapshot.params['id'];
      }
    }

    this.clientForm = this.fb.group({
      first_name: [''],
      last_name: [''],
      date_of_birth: [''],
      phone: [''],
      email: [''],
    });

    this.getFacilityDetails();

    // let data = JSON.parse(localStorage.getItem('myKey') || '{}');
    // let facility = JSON.parse(localStorage.getItem('facilityObj') || '{}');
    // if (Object.keys(data).length === 0) {
    //   this.getFacilityDetails();
    // }
    // else {
    //   if (facility) {
    //     this.shared.getDetails(facility);
    //   }
    //   if (data?.facilityId && !data.locationId) {
    //     this.getLocations(data?.facilityId);
    //   }
    //   else if (data?.facilityId && data?.locationId && !data.serviceId) {
    //     this.getServicebyLocationId(data?.locationId);
    //   }
    //   else if (data?.facilityId && data?.locationId && data.serviceId) {
    //     this.getStepsbyServiceId(data?.serviceId)
    //   }
    // }
  }

  onUpdateTab(event: any) {
    if (event == true) {
      // After info submission, show the steps instead of going back to menu
      this.isMenuSteps = true;
      this.tab_name = 'menu';
    }
  }

  initialiseAppointmentForm() {
    this.appointmentForm = this.fb.group({
      id: [''],
      location_id: [''],
      department_id: [''],
      service_id: [''],
      is_new: [''],
      insurance: [''],
      custom: this.fb.array([]),
      treatments: this.fb.array([]),
      preffered_selected_time: [''],
      // this.createCustom()
    });
  }

  getFacilityDetails() {
    return new Promise((resolve) => {
      this.loading = true;
      this.auth.get('facility/public/' + this.id).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.loading = false;
            this.facility_details = res.data;
            let storedData = JSON.parse(localStorage.getItem('myKey') || '{}'); // Fallback to '{}' if null
            storedData['facilityId'] = this.facility_details?._id;
            localStorage.setItem('myKey', JSON.stringify(storedData));
            localStorage.setItem(
              'facilityObj',
              JSON.stringify(this.facility_details)
            );
            this.shared.getDetails(this.facility_details);
            this.shared.updateStep({ previous: 'Menu', next: 'Location' });
            this.getLocations(this.facility_details?._id);
            resolve(true);
          }
        },
        error: (err) => {
          this.loading = false;
          resolve(false);
        },
      });
    });
  }

  getLocations(id: any) {
    this.getLoader = true;
    this.auth.get('location/public/' + this.id).subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.getLoader = false;
          this.location_arr = res.data;
          if (this.location_arr.length == 1) {
            this.getDepartmentbyLocationId(this.location_arr[0]?._id);
          }
        }
      },
      error: (err) => {
        this.getLoader = false;
      },
    });
  }

  location_id: any;
  getDepartmentbyLocationId(id: any) {
    this.location_id = id;
    this.isMenuLocation = false;
    this.isMenuDepartment = true;
    this.getLoader = true;
    this.auth
      .get('department/public/' + this.id + '?location=' + id)
      .subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.getLoader = false;
            let storedData = JSON.parse(localStorage.getItem('myKey') || '{}');
            storedData['locationId'] = id;
            localStorage.setItem('myKey', JSON.stringify(storedData));
            this.shared.updateStep({
              previous: 'Location',
              next: 'Department',
            });
            this.department_arr = res.data?.data;
            if (this.department_arr.length == 1) {
              this.getDepartmentId(this.department_arr[0]?._id);
            }
          }
        },
        error: (err) => {
          this.getLoader = false;
          this.isMenuLocation = true;
          this.isMenuDepartment = false;
          this.shared.showAlert('error', 'Error', err.error.message);
        },
      });
  }

  department_id: any;
  getDepartmentId(id: any) {
    this.department_id = id;
    this.isMenuDepartment = false;
    this.isMenuService = true;
    let storedData = JSON.parse(localStorage.getItem('myKey') || '{}');
    storedData['departmentId'] = id;
    localStorage.setItem('myKey', JSON.stringify(storedData));
    this.shared.updateStep({ previous: 'Location', next: 'Service' });
    this.getServicebyLocationId(this.location_id);
  }

  getServicebyLocationId(id: any) {
    this.isMenuLocation = false;
    this.isMenuDepartment = false;
    this.isMenuService = true;
    this.getLoader = true;
    this.auth.get('service/public/' + this.id + '?location=' + id).subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.getLoader = false;
          this.service_arr = res.data?.data;
        }
        this.getTreatments();
      },
      error: (err) => {
        this.getLoader = false;
        this.isMenuLocation = true;
        this.isMenuService = false;
        this.shared.showAlert('error', 'Error', err.error.message);
      },
    });
  }

  getServiceName(item: any): string {
    if (item?.is_predefined && this.predefinedServices[item.service_name]) {
      return (
        this.predefinedServices[item.service_name][this.selectedLang] ||
        item.service_name
      );
    }
    return item?.service_name;
  }

  getTreatments() {
    this.getLoader = true;
    let treatment = [];
    this.auth
      .get('treatment/public/' + this.id + '?location=' + this.location_id)
      .subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.getLoader = false;
            treatment = res.data?.data;
            let matching = treatment.filter(
              (item: any) => item.department_id === this.department_id
            );
            let nonMatching = treatment.filter(
              (item: any) => item.department_id !== this.department_id
            );
            this.treatment_arr = [...matching, ...nonMatching];
          }
        },
        error: (err) => {
          this.getLoader = false;
          this.treatment_arr = [];
        },
      });
  }

  selected_date: any;
  selectDate() {
    if (this.selected_date && this.service_name == 'termin') {
      this.getAvailableSlots();
    }
  }
  getAvailableSlots() {
    this.auth
      .get(
        'availability/durationSlots?date=' +
          this.selected_date +
          '&location_id=' +
          this.location_id +
          '&facility_id=' +
          this.id
      )
      .subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.availability_arr = res.data;
          }
        },
        error: (err) => {
          this.availability_arr = [];
          // this.shared.showAlert('error', 'Error', err.error.message);
        },
      });
  }
  formatTime(start: any) {
    const date = new Date(start);
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const formatted = `${hours}:${minutes}`;
    return formatted;
  }

  selected_slot: any;
  start_time: any;
  selectSlot(startTime: string) {
    this.selected_slot = startTime;
    this.start_time = this.formatTime(startTime);
    let endTime;
    if (this.total_treatment_time) {
      endTime = this.calculateEndTime(
        this.start_time,
        this.total_treatment_time
      );
    }
    this.appointmentForm.patchValue({
      preffered_selected_time: {
        date: this.selected_date,
        start_time: this.start_time,
        end_time: endTime,
      },
    });
  }

  customStepCounter = 0;
  service_name: any;
  getStepsbyServiceId(id: any, name: any) {
    this.service_name = name;
    this.isMenuService = false;
    this.isMenuSteps = true;
    this.auth.get('step/public/service/' + id).subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          let storedData = JSON.parse(localStorage.getItem('myKey') || '{}');
          storedData['serviceId'] = id;
          localStorage.setItem('myKey', JSON.stringify(storedData));
          let info = localStorage.getItem('info');
          if (!info) {
            localStorage.setItem('info', '{}');
          }
          // Allow auto-skip when coming from service selection flow
          this.allowInfoAutoSkip = true;
          this.tab_name = 'info';
          this.shared.updateStep({ previous: 'Service', next: 'Info' });
          this.steps_arr = res.data?.data;

          this.initialiseAppointmentForm();
          this.initializeCustomFormArray();
          if (this.steps_arr[0]?.step_type == 'click') {
            if (this.steps_arr[0].step_meta.action_type == 'next-step') {
              this.counter++;
            }
          }
        }
      },
      error: (err) => {
        this.isMenuService = true;
        this.isMenuSteps = false;
        this.shared.showAlert('error', 'Error', err.error.message);
      },
    });
  }

  get customArray(): FormArray {
    return this.appointmentForm.get('custom') as FormArray;
  }

  createCustom(): FormGroup {
    let step;
    if (this.steps_arr[this.counter]) {
      step = this.steps_arr[this.counter];
    } else {
      step = this.steps_arr[0];
    }
    return this.fb.group({
      step_id: step?._id,
      step_description: step?.step_description,
      junction_type: step?.step_meta?.junction_type,
      answer_array: this.fb.array([]),
    });
  }

  initializeCustomFormArray() {
    this.customArray.push(this.createCustom());
  }

  createAnswer(value: any): FormGroup {
    return this.fb.group({
      value: [value],
    });
  }

  getAnswerArray(index: number): FormArray {
    const customGroup = this.customArray.at(index) as FormGroup;
    return customGroup.get('answer_array') as FormArray;
  }

  handleAnswer(answer: any, junction_type: string, index: number) {
    const answerArray = this.getAnswerArray(index);

    if (junction_type !== 'multi_answers') {
      answerArray.clear();
    }
    switch (junction_type) {
      case 'text':
        if (typeof answer === 'string') {
          answerArray.push(this.createAnswer(answer));
        }
        break;

      case 'answers':
        if (answer?.answer_text) {
          answerArray.push(this.createAnswer(answer.answer_text));
          this.selectedAnswerId = answer.answer_text;
        }
        break;

      case 'multi_answers':
        if (answer?.answer_text) {
          const existingIndex = answerArray.controls.findIndex(
            (ctrl) => ctrl.value.value === answer.answer_text
          );

          existingIndex > -1
            ? answerArray.removeAt(existingIndex)
            : answerArray.push(this.createAnswer(answer.answer_text));
        }
        break;

      case 'slider_small':
        if (answer) {
          answerArray.push(this.createAnswer(answer.target.value));
        }
        break;

      case 'slider_large':
        if (answer) {
          answerArray.push(this.createAnswer(answer.target.value));
        }
        break;

      case 'slider_emotion':
        if (answer) {
          this.selectedSmileyLabel = answer?.label;
          answerArray.push(this.createAnswer(answer.label));
        }
        break;

      case 'slider_consent':
        if (answer) {
          answerArray.push(this.createAnswer(answer.value));
        }
        break;

      case 'upload':
        let files = answer.target.files;
        if (files[0]) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            let image = e.target?.result;
          };
          reader.readAsDataURL(files[0]);
        }

        let formData = new FormData();
        formData.append('file', files[0]);
        this.auth.post('media/public', formData).subscribe({
          next: (res: any) => {
            if (res.status == 200) {
              this.shared.showAlert('success', 'Success', res.message);
              answerArray.push(this.createAnswer(res.data?.media));
            }
          },
          error: (err) => {
            this.shared.showAlert('error', 'Error', err.error.message);
          },
        });
        break;

      case 'signature':
        if (answer) {
          answerArray.push(this.createAnswer(this.sign));
        }
        break;
    }
  }

  isAnswerSelected(answerId: string, index: number): boolean {
    return this.getAnswerArray(index).controls.some(
      (ctrl) => ctrl.value.value === answerId
    );
  }

  selectedTreatments: string[] = [];
  treatments_time: number[] = [];
  total_treatment_time: any;

  treatmentsCheckbox(treatmentId: string, treatment: any) {
    const treatmentArray = this.appointmentForm.get('treatments') as FormArray;
    const index = treatmentArray.controls.findIndex(
      (group) => group.value.treatment_id === treatmentId
    );

    if (index === -1) {
      treatmentArray.push(
        this.fb.group({
          treatment_id: treatmentId,
          treatment_name: treatment.name,
        })
      );
      this.selectedTreatments.push(treatmentId);
      if (treatment?.duration) {
        this.treatments_time.push(treatment.duration);
      }
    } else {
      treatmentArray.removeAt(index);
      const idIndex = this.selectedTreatments.indexOf(treatmentId);
      if (idIndex !== -1) {
        this.selectedTreatments.splice(idIndex, 1);
        this.treatments_time.splice(idIndex, 1);
      }
    }
    this.total_treatment_time = this.treatments_time.reduce(
      (total, duration) => total + duration,
      0
    );
    if (this.start_time) {
      let endTime;
      endTime = this.calculateEndTime(
        this.start_time,
        this.total_treatment_time
      );
      this.appointmentForm.patchValue({
        preffered_selected_time: {
          ...this.appointmentForm.value.preffered_selected_time,
          end_time: endTime,
        },
      });
    }
  }

  calculateEndTime(startTime: string, duration: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const start = new Date();
    start.setHours(hours, minutes + duration);

    const endHours = start.getHours().toString().padStart(2, '0');
    const endMinutes = start.getMinutes().toString().padStart(2, '0');

    return `${endHours}:${endMinutes}`;
  }

  isSelected(treatmentId: string): boolean {
    return this.selectedTreatments.includes(treatmentId);
  }

  client_type: string = '';
  selectedInsuranceType: string = '';

  clientInformation(type: string, insurance: string, treatment: any) {
    if (type && this.counter == 2) {
      if (type == 'new') {
        this.appointmentForm.patchValue({ is_new: true });
      } else {
        this.appointmentForm.patchValue({ is_new: false });
      }
      this.client_type = type;
      this.counter++;
    } else if (type && insurance && this.counter == 3) {
      this.selectedInsuranceType = insurance;
      this.appointmentForm.patchValue({ insurance: insurance });
      // this.counter++;
    } else if (treatment) {
      // this.appointmentForm.patchValue({ treatment_id: treatment?._id, treatment_name: treatment?.name });
    }

    if (this.isLastStep()) {
      this.saveAppointment();
    }
  }

  getSanitizedMedia(video: any): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(video);
  }

  openLink(doc: any) {
    window.open(doc);
  }

  drawSignature(event: MouseEvent | Touch) {
    this.sign = this.customer_signature.toDataURL();
  }
  clearClientSignature() {
    this.customer_signature.clear();
    const canvas = this.customer_signature.getCanvas();
    canvas.width = 600;
    canvas.height = 275;
    this.sign = '';
  }

  isLastStep(): boolean {
    return this.counter === this.steps_arr.length;
  }

  toNext() {
    // if (this.steps_arr.length == this.counter) {
    //   this.saveAppointment();
    // }

    // Open external link if next step is external_link
    if (
      this.steps_arr[this.counter]?.step_meta?.junction_type == 'external_link'
    ) {
      let url = this.steps_arr[this.counter]?.step_meta?.media;
      if (url) {
        window.open(url, '_blank');
      }
    }
    if (this.steps_arr[this.counter]?.step_type == 'custom') {
      this.initializeCustomFormArray();
      this.customStepCounter++;
      this.counter++;
    } else if (this.counter < this.steps_arr.length) {
      this.counter++;
    }
  }

  toPrevious() {
    if (this.steps_arr[this.counter - 1]?.step_type == 'custom') {
      const array = this.appointmentForm.get('custom') as FormArray;
      array.removeAt(this.customStepCounter);
      this.customStepCounter--;
    }

    if (this.counter > 1) {
      this.counter--;
    }
  }

  saveAppointment() {
    let info = JSON.parse(localStorage.getItem('myKey') || '{}');
    let client_info = JSON.parse(localStorage.getItem('info') || '{}');
    this.clientForm.patchValue({
      first_name: client_info?.first_name,
      last_name: client_info?.last_name,
      date_of_birth: client_info?.date_of_birth,
      phone: client_info?.phone,
      email: client_info?.email,
    });
    this.appointmentForm.patchValue({
      id: info?.facilityId,
      location_id: info?.locationId,
      department_id: info?.departmentId,
      service_id: info?.serviceId,
    });
    this.auth
      .post('request', {
        service: this.appointmentForm.value,
        info: this.clientForm.value,
      })
      .subscribe({
        next: (res: any) => {
          if (res.status == 201) {
            this.shared.showAlert('success', 'Successful', res.message);
            this.tab_name = 'chat';
            this.router.navigate(
              [`/public/${res.data.facility}/${res.data?.request}`],
              {
                queryParams: { patient_id: res.data.patient },
              }
            );
          }
        },
        error: (err) => {
          this.shared.showAlert('error', 'Error', err.error.message);
        },
      });
  }
}
