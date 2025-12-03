import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { GeneralServiceService } from '../../../services/general-service.service';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit {
  // profile:boolean=false;
  // clickProfile():void{
  //   this.profile=!this.profile;
  // }

  chatForm!: FormGroup;
  addAppointmentForm!: FormGroup;

  loading = false;
  submitted = false;

  getLoader = false;
  skeleton_arr = new Array(6);

  chats_arr: any = [];
  search = '';
  no = 0;
  size = 10;
  loadmore: boolean = true;
  load: boolean = true;
  loaded: number = 0;
  total = 0;

  showChat = false;
  user_details: any;
  chat_details: any;

  patient_arr: any = [];
  location_arr: any = [];
  departments_arr: any = [];
  services_arr: any = [];
  treatments_arr: any = [];

  selectedLang: string = '';

  smileys = [
    { icon: '😡', label: 'Angry' },
    { icon: '😕', label: 'Sad' },
    { icon: '😐', label: 'Neutral' },
    { icon: '😊', label: 'Happy' },
    { icon: '😍', label: 'Excellent' },
  ];

  predefinedServices: any = {
    termin: {
      en: 'Appointment Service',
      de: 'Termin Standardeinstellung'
    }
  };

  @ViewChild('closeAddModal') closeAddModal!: ElementRef;
  @ViewChild('scrollChat') scrollChat!: ElementRef;

  constructor(private fb: FormBuilder, private auth: AuthService, private shared: GeneralServiceService, private translate: TranslateService, private cdr: ChangeDetectorRef) {
    this.shared.language$.subscribe((lang: string) => {
      this.selectedLang = lang.replace(/"/g, '');
      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    let lang = localStorage.getItem('system_lang') || 'de';
    this.selectedLang = lang.replace(/"/g, '');

    this.chatForm = this.fb.group({
      facility_id: [''],
      request_id: [''],
      from: [''],
      to: [''],
      message: ['', Validators.required],
    });
    this.addAppointmentForm = this.fb.group({
      request_id: [''],
      start_date: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      patient_id: ['', Validators.required],
      location_id: ['', Validators.required],
      department_id: ['', Validators.required],
      service_id: ['', Validators.required],
      message_type: ['appointmentData'],
      treatments: this.fb.array([])
    });
    this.getChats();
  }

  getChats() {
    let endpoint = '';
    this.getLoader = true;
    this.load = true;
    this.loadmore = false;
    this.no++;
    if (this.search) {
      endpoint = 'request?skip=' + this.no + '&limit=' + this.size + '&search=' + this.search
    }
    else {
      endpoint = 'request?skip=' + this.no + '&limit=' + this.size
    }
    return new Promise((resolve) => {
      this.auth.get(endpoint).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.getLoader = false;
            if (this.no == 1) {
              this.chats_arr = res.data?.data;
              this.loaded = res.data?.data?.length;
            }
            else {
              for (let i = 0; i < res.data?.data?.length; i++) {
                this.chats_arr.push(res.data?.data[i]);
                this.loaded++;
              }
            }
            this.total = parseInt(res.data?.total);
            this.load = false;
            this.loadmore = true;
            if (this.loaded >= this.total) {
              this.loadmore = false;
              this.load = false;
            }
          }
          resolve(true)
        },
        error: (err) => {
          this.getLoader = false;
          this.loadmore = false;
          this.load = false;
          resolve(false);
        }
      })
    })
  }

  resetsearch() {
    this.no = 0;
    this.size = 10;
    this.total = 0;
    this.loaded = 0;
    this.chats_arr = []
    this.getChats();
  }

  getServiceName(item: any): string {
    if (this.predefinedServices[item.service_name]) {
      return this.predefinedServices[item.service_name][this.selectedLang] || item.service_name;
    }
    return item?.service_name;
  }

  request_user_data: any;
  request_id: any;
  getChatbyId(id: any, user: any) {
    this.request_id = id;
    this.request_user_data = user;
    this.auth.get('chat/' + id).subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.showChat = true;
          this.user_details = user;
          this.chat_details = res.data?.data;
        }
        this.scrollToBottom();
      },
      error: (err) => {
        this.shared.showAlert('error', 'Error', err.error.message);
      }
    })
  }

  setDetails() {
    let userData = JSON.parse(localStorage.getItem('userdata') || '{}')
    this.chatForm.patchValue({
      facility_id: userData ? userData?.facility_id?._id : '',
      request_id: this.request_id,
      from: userData ? userData?.facility_id?._id : '',
      to: this.request_user_data?.patient_id,
    });
  }

  scrollToBottom() {
    if (this.scrollChat && this.scrollChat.nativeElement) {
      this.scrollChat.nativeElement.scrollIntoView({ behavior: 'smooth' });
      this.scrollChat.nativeElement.scrollTop = this.scrollChat.nativeElement.scrollHeight;
    }
  }

  sendMessage() {
    this.submitted = true;
    this.setDetails();
    this.auth.post('chat', this.chatForm.value).subscribe({
      next: (res: any) => {
        if (res.status == 201) {
          this.chatForm.patchValue({ message: '' });
          const translatedMsg = this.translate.instant('responses.message_sent_successfully');
          this.shared.showAlert('success', 'Successful', translatedMsg);
          this.submitted = false;
        }
        this.getChatbyId(this.request_id, this.request_user_data)
      },
      error: (err) => {
        this.submitted = false;
        this.shared.showAlert('error', 'Error', err.error.message);
      }
    })
  }

  createAppointment() {
    const treatmentArray = this.addAppointmentForm.get('treatments') as FormArray;
    treatmentArray.clear();
    this.selected_treatment = [];
    this.addAppointmentForm.get("patient_id")?.disable();
    this.getPatients();
    this.getLocations();
    this.getDepartmentbyLocationId(this.user_details?.location_id);
    this.getServicebyLocationId(this.user_details?.location_id);
    this.getTreatmentbyDepartmentId(this.user_details?.department_id);

    this.addAppointmentForm.patchValue({
      patient_id: this.user_details?.patient_data?._id,
      start_date: this.user_details?.meta?.preffered_selected_time?.date,
      start_time: this.user_details?.meta?.preffered_selected_time?.start_time,
      end_time: this.user_details?.meta?.preffered_selected_time?.end_time,
      location_id: this.user_details?.location_data?._id,
      department_id: this.user_details?.department_data?._id,
      service_id: this.user_details?.service_data?._id,
    });
    for (let i = 0; i < this.user_details?.meta?.treatments.length; i++) {
      treatmentArray.push(this.fb.control(this.user_details?.meta?.treatments[i].treatment_id))
      this.selected_treatment.push(this.user_details?.meta?.treatments[i].treatment_name);
    }
  }

  getPatients() {
    this.auth.get('patient').subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.patient_arr = res.data?.data;
        }
      },
      error: (err) => {

      }
    })
  }

  getLocations() {
    this.auth.get('location').subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.location_arr = res.data?.data;
        }
      },
      error: (err) => {

      }
    })
  }

  onSelectLocation(event: any) {
    let value = event.target.value;
    if (value) {
      this.getDepartmentbyLocationId(value);
      this.getServicebyLocationId(value);
    }
  }

  getDepartmentbyLocationId(id: any) {
    return new Promise((resolve) => {
      this.auth.get('department?location_id=' + id).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.departments_arr = res.data?.data;
            resolve(true);
          }
        },
        error: (err) => {
          this.departments_arr = [];
          resolve(false);
        }
      })
    })
  }

  getServicebyLocationId(id: any) {
    return new Promise((resolve) => {
      this.auth.get('service?location_id=' + id).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.services_arr = res.data?.data;
            resolve(true);
          }
        },
        error: (err) => {
          this.services_arr = [];
          resolve(false);
        }
      })
    })
  }

  onSelectDepartment(event: any) {
    let department = event.target.value;
    if (department) {
      this.getTreatmentbyDepartmentId(department);
    }
  }

  getTreatmentbyDepartmentId(id: any) {
    return new Promise((resolve) => {
      this.auth.get('treatment?department_id=' + id).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.treatments_arr = res.data?.data;
            resolve(true);
          }
        },
        error: (err) => {
          this.treatments_arr = [];
          resolve(false);
        }
      })
    })
  }

  selected_treatment: any = [];
  onSelect(event: any) {
    const selectedValue = event.target.value;
    const [name, id] = selectedValue.split(',');
    const treatmentArray = this.addAppointmentForm.get('treatments') as FormArray;
    if (id && name) {
      treatmentArray.push(this.fb.control(id));
      this.selected_treatment.push(name);
    }
  }

  removeSelection(index: number) {
    const treatmentArray = this.addAppointmentForm.get('treatments') as FormArray;
    treatmentArray.removeAt(index);
    this.selected_treatment.splice(index, 1)
  }

  saveAppointment() {
    this.addAppointmentForm.get("patient_id")?.enable();
    this.addAppointmentForm.patchValue({ request_id: this.request_id });
    this.setDetails();
    this.loading = true;
    this.submitted = true;
    if (this.addAppointmentForm.invalid) {
      this.loading = false;
    }
    else {
      this.auth.post('chat', { ...this.addAppointmentForm.value, ...this.chatForm.value }).subscribe({
        next: (res: any) => {
          if (res.status == 201) {
            this.loading = false;
            this.resetForm();
            this.closeAddModal.nativeElement.click();
            const translatedMsg = this.translate.instant('responses.appointment_created_successfully');
            this.shared.showAlert('success', 'Successful', translatedMsg);
            this.submitted = false;
            this.getChatbyId(this.request_id, this.request_user_data)
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

  resetForm() {
    this.addAppointmentForm.reset();
    const treatmentArray = this.addAppointmentForm.get('treatments') as FormArray;
    treatmentArray.clear();
    this.selected_treatment = [];
    this.addAppointmentForm.patchValue({
      patient_id: '',
      location_id: '',
      department_id: '',
      service_id: '',
      treatment_id: '',
    })
  }

  sendReminder() {
    Swal.fire({
      title: this.translate.instant('sweet_alert.are_you_sure'),
      text: this.translate.instant('sweet_alert.send_email_text'),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000000",
      cancelButtonColor: "#d33",
      confirmButtonText: this.translate.instant('sweet_alert.send_email'),
      cancelButtonText: this.translate.instant('sweet_alert.cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.auth.post('chat/reminder', { id: this.request_user_data?.patient_id, request_id: this.request_id }).subscribe({
          next: (res: any) => {
            if (res.status == 200) {
              const translatedMsg = this.translate.instant('responses.email_sent_successfully');
              this.shared.showAlert('success', 'Successful', translatedMsg);
              this.getChatbyId(this.request_id, this.request_user_data)
            }
          },
          error: (err) => {
            this.shared.showAlert('error', 'Error', err.error.message);
          }
        })
      }
    });
  }

  splitTime(dateTime: string): string {
    if (!dateTime) return '';
    const parts = dateTime.split('T');
    if (parts.length < 2) return '';
    return parts[1].substring(0, 5);
  }

  getIconForValue(value: string) {
    const match = this.smileys.find(s => s.label === value);
    return match ? match.icon : '';
  }
}
