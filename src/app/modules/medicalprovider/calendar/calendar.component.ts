import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DatesSetArg, EventClickArg } from '@fullcalendar/core/index.js';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import enLocale from '@fullcalendar/core/locales/en-gb';
import deLocale from '@fullcalendar/core/locales/de';

import { Select2Module } from 'ng-select2-component';
import { AuthService } from '../../../auth/auth.service';
import { GeneralServiceService } from '../../../services/general-service.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FullCalendarModule, Select2Module, TranslateModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})

export class CalendarComponent implements OnInit {
  addAppointmentForm!: FormGroup;

  loading = false;
  submitted = false;

  getLoader = false;

  calendarOptions: CalendarOptions = {
    timeZone: 'UTC',
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
    contentHeight: 'auto',
    themeSystem: 'bootstrap5',
    firstDay: 1,
    locale: deLocale,
    locales: [enLocale, deLocale],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,dayGridMonth'
    },
    events: [],
    datesSet: this.handleDatesSet.bind(this),
    editable: false,
    eventClick: this.handleEventClick.bind(this),
  }

  minEndTime: string = '';

  patient_arr: any = [];
  required_patient: any = [];
  location_arr: any = [];
  departments_arr: any = [];
  services_arr: any = [];
  treatments_arr: any = [];

  calendar_start_date: any;
  calendar_end_date: any;
  eventsarray: any = [];

  date: any;
  location_id: any;

  current_date: any;

  selectedLang: string = '';
  predefinedServices: any = {
    termin: {
      en: 'Appointment Service',
      de: 'Termin Standardeinstellung'
    }
  };

  weekdays = [
    "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"
  ]

  @ViewChild('closeAddModal') closeAddModal!: ElementRef;

  constructor(private fb: FormBuilder, private auth: AuthService, private shared: GeneralServiceService, private translate: TranslateService, private cdr: ChangeDetectorRef) {
    this.shared.language$.subscribe((lang: string) => {
      this.calendarOptions = {
        ...this.calendarOptions,
        locale: lang === 'de' ? deLocale : enLocale
      };
      this.selectedLang = lang.replace(/"/g, '');
      this.cdr.detectChanges();
    });

    this.shared.location$.subscribe((location) => {
      this.location_id = location?._id;
      if (this.calendar_start_date && this.calendar_end_date && this.location_id) {
        this.getAppointments();
        this.getDepartmentbyLocationId(this.location_id);
        this.getServicebyLocationId(this.location_id);
        this.getTreatmentbyLocationtId(this.location_id);
      }
      if (this.date && this.location_id) {
        this.getAvailableTime();
      }
    });
  }

  ngOnInit(): void {
    let lang = localStorage.getItem('system_lang') || 'de';
    this.selectedLang = lang.replace(/"/g, '');

    let today = new Date();
    this.current_date = today.toISOString().split('T')[0];
    let setLang = JSON.parse(localStorage.getItem('system_lang') || '{}');
    if (Object.keys(setLang).length > 0) {
      this.calendarOptions = {
        ...this.calendarOptions,
        locale: setLang === 'de' ? deLocale : enLocale
      };
    }

    this.addAppointmentForm = this.fb.group({
      start_date: ['', Validators.required],
      // end_date: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      patient_id: ['', Validators.required],
      location_id: ['', Validators.required],
      department_id: ['', Validators.required],
      service_id: ['', Validators.required],
      treatments: this.fb.array([])
      // treatment_step_id: [''],
    });
    this.getPatients();
    this.getLocations();
    this.getDepartmentbyLocationId(this.location_id);
    this.getServicebyLocationId(this.location_id);
    this.getTreatmentbyLocationtId(this.location_id);
  }

  openModal() {
    this.addAppointmentForm.get('location_id')?.disable();
    this.addAppointmentForm.patchValue({ location_id: this.location_id });
  }

  getPatients() {
    this.auth.get('patient').subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.patient_arr = res.data?.data;
          this.required_patient = [{
            options: this.patient_arr.map((mem: any) => ({
              value: mem._id,
              label: `${mem.first_name} ${mem.last_name}`
            })
            )
          }]
        }
      },
      error: (err) => {

      }
    });
  }
  getLocations() {
    this.auth.get('location?status=true').subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.location_arr = res.data?.data;
        }
      },
      error: (err) => {

      }
    })
  }

  selectDate(event: any) {
    if (event) {
      this.date = event.target.value;
      this.getAvailableTime();
    }
  }
  selectStartTime(event: any) {
    if (event) {
      let endTime = this.addMinutesToTime(event.target.value, this.treatment_time);
      this.addAppointmentForm.patchValue({ end_time: endTime });
    }
  }
  getAvailableTime() {
    this.auth.get('availability/availableTime?date=' + this.date + '&location_id=' + this.location_id).subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          // let workingHours = res.data?.working_hours || [];
          // let appointmentData = res.data?.appointment_data || [];
          // let available = this.getNearestTimeAvailable(workingHours, appointmentData);
          this.addAppointmentForm.patchValue({ start_time: res.data?.start_time });
        }
      },
      error: (err) => {
        if (err.error.status === 404) {
          const translatedErrorMsg = this.translate.instant('responses.availibility_not_found');
          this.shared.showAlert('error', 'Error', translatedErrorMsg);
        } else {
          this.shared.showAlert('error', 'Error', err.error.message);
        }
      }
    })
  }
  getNearestTimeAvailable(workingHours: any[], appointmentData: any[]) {
    const now = new Date();
    const selectedDate = new Date(this.date);

    const isToday =
      now.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const timeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const bookedTimes = appointmentData.map(app => {
      const start = new Date(app.start_date);
      return `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
    });

    const futureFreeSlots = workingHours
      .filter(slot => {
        const slotTime = slot?.opening_hours;
        const isAfterNow = timeToMinutes(slotTime) >= currentMinutes;

        return (
          (!isToday || isAfterNow) &&
          !bookedTimes.includes(slotTime)
        );
      })
      .sort((a, b) => timeToMinutes(a?.opening_hours) - timeToMinutes(b?.opening_hours));

    const nearestSlot = futureFreeSlots?.[0] || null;
    if (nearestSlot) {
      return nearestSlot;
    } else {
      this.shared.showAlert('error', 'Error', 'No slot available');
      return null;
    }
  }

  addMinutesToTime(time: string, minutesToAdd: number): string {
    const [h, m] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + minutesToAdd);

    return date.toTimeString().slice(0, 5);
  }

  // onSelectLocation(event: any) {
  //   let value = event.target.value;
  //   this.location_id = value;
  //   if (value) {

  //     if (this.date && this.location_id) {
  //     }
  //   }
  // }

  getDepartmentbyLocationId(id: any) {
    return new Promise((resolve) => {
      this.auth.get('department?location_id=' + id + '&status=true').subscribe({
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
            const appointmentService = this.services_arr.find((service: { service_name: string; }) => service.service_name === 'appointment');
            if (appointmentService) {
              this.addAppointmentForm.patchValue({
                service_id: appointmentService._id
              });
            }
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
  // onSelectDepartment(event: any) {
  //   let department = event.target.value;
  //   if (department) {
  //     this.getTreatmentbyDepartmentId(department);
  //   }
  // }
  // getTreatmentbyDepartmentId(id: any) {
  getTreatmentbyLocationtId(id: any) {
    return new Promise((resolve) => {
      this.auth.get('treatment?location_id=' + this.location_id).subscribe({
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
  treatment_time: number = 0;
  onSelect(event: any) {
    const selectedValue = event.target.value;
    const [name, id] = selectedValue.split(',');

    if (!id || !name) return;

    const treatmentArray = this.addAppointmentForm.get('treatments') as FormArray;
    const alreadyAdded = treatmentArray.value.includes(id);
    if (alreadyAdded) return;

    const selectedTreatment = this.treatments_arr.find((t: { _id: any }) => t._id === id);
    if (selectedTreatment?.duration) {
      this.treatment_time += selectedTreatment.duration;
    }
    const startTime = this.addAppointmentForm.value.start_time;
    const treatmentTime = this.treatment_time;
    const endTime = this.addMinutesToTime(startTime, treatmentTime);
    this.addAppointmentForm.patchValue({ end_time: endTime });

    treatmentArray.push(this.fb.control(id));
    this.selected_treatment.push(name);
  }

  removeSelection(index: number) {
    const treatmentArray = this.addAppointmentForm.get('treatments') as FormArray;
    const removedTreatmentId = treatmentArray.at(index)?.value;

    const removedTreatment = this.treatments_arr.find((t: { _id: any }) => t._id === removedTreatmentId);
    if (removedTreatment?.duration) {
      this.treatment_time -= removedTreatment.duration;
    }

    const startTime = this.addAppointmentForm.value.start_time;
    const updatedEndTime = this.addMinutesToTime(startTime, this.treatment_time);
    this.addAppointmentForm.patchValue({ end_time: updatedEndTime });

    treatmentArray.removeAt(index);
    this.selected_treatment.splice(index, 1)
  }

  saveAppointment() {
    this.addAppointmentForm.get('location_id')?.enable();
    this.addAppointmentForm.patchValue({ location_id: this.location_id });
    this.loading = true;
    this.submitted = true;
    if (this.addAppointmentForm.invalid) {
      this.loading = false;
    }
    else {
      this.auth.post('appointment', this.addAppointmentForm.value).subscribe({
        next: (res: any) => {
          if (res.status == 201) {
            this.loading = false;
            this.resetForm();
            this.treatment_time = 0;
            this.closeAddModal.nativeElement.click();
            const translatedMsg = this.translate.instant('responses.appointment_created_successfully');
            this.shared.showAlert('success', 'Successful', translatedMsg);
            this.submitted = false;
            this.getAppointments();
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
    this.addAppointmentForm.patchValue({
      patient_id: '',
      location_id: '',
      service_id: '',
      department_id: '',
    })
    const treatmentArray = this.addAppointmentForm.get('treatments') as FormArray;
    treatmentArray.clear();
    this.selected_treatment = [];
  }

  handleDatesSet(arg: DatesSetArg) {
    this.calendar_start_date = this.shared.formatDate(arg?.startStr);
    this.calendar_end_date = this.shared.formatDate(arg?.endStr);
    this.getAppointments();
  }

  getServiceName(item: any): string {
    if (this.predefinedServices[item.service_name]) {
      return this.predefinedServices[item.service_name][this.selectedLang] || item.service_name;
    }
    return item?.service_name;
  }

  getAppointments() {
    this.eventsarray = [];
    let appointment_arr = [];
    this.getLoader = true;
    if (this.location_id) {
      this.auth.get('appointment?start_date=' + this.calendar_start_date + '&end_date=' + this.calendar_end_date + '&location_id=' + this.location_id).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            appointment_arr = res.data?.data;
            for (let i = 0; i < appointment_arr.length; i++) {
              let event_color;
              let date = new Date(appointment_arr[i]?.start_date);
              let end_date = new Date(appointment_arr[i]?.end_date);
              if (appointment_arr[i]?.status == 'approved') {
                event_color = '#198754cc';
              }
              else if (appointment_arr[i]?.status == 'rejected') {
                event_color = '#dc3545cc';
              }
              else if (appointment_arr[i]?.status == 'cancelled') {
                event_color = '#dc3545';
              }
              else {
                event_color = '#595959'
              }
              this.eventsarray.push({ backgroundColor: event_color, extendedProps: appointment_arr[i], start: date.toISOString(), end: end_date.toISOString() })
            }
            this.calendarOptions.events = this.eventsarray;
            this.calendarOptions.eventDidMount = ((data: any) => {
              data.el.style.backgroundColor = data.event.backgroundColor || data.event.extendedProps.color || '#595959';

              const found = data.el.querySelector('.fc-event-title');
              const htmldata = data.event._def?.extendedProps;

              const treatments = htmldata?.treatment_data;
              let treatmentsListHTML = '';
              if (treatments && treatments.length > 0) {
                treatments.forEach((treatment: any) => {
                  treatmentsListHTML += `
                    <div>${treatment?.name || 'No treatment name available'}</div>
                  `;
                });
              } else {
                treatmentsListHTML = `
                  <div>No treatments available</div>
                `;
              }

              found.innerHTML = `
                <div class="d-grid gap-1">
                  <div class="d-flex align-items-center gap-2 small">
                    <i class="ri-user-3-line"></i>
                    <div>
                    ${htmldata?.patient_data?.first_name
                  ? htmldata.patient_data.first_name
                  : ''
                }
                ${htmldata?.patient_data?.last_name
                  ? htmldata.patient_data.last_name
                  : ''
                }</div>
                  </div>
                  <div class="d-flex align-items-center gap-2 small">
                    <i class="ri-time-line"></i>
                    <div style="margin-top: 1px;">
                      ${this.shared.getTimefromDate(htmldata?.start_date)} - ${this.shared.getTimefromDate(htmldata?.end_date)}
                    </div>
                  </div>
                  <div class="d-flex align-items-center gap-2 small">
                    <i class="ri-virus-line"></i>
                    <div>${this.getServiceName(htmldata?.service_data)}</div>
                  </div>
                  <div class="d-flex gap-2 small">
                    <i class="ri-capsule-fill"></i>
                    <div class="text-start">${treatmentsListHTML}</div>
                  </div>
                  <div class="d-flex gap-2 small">
                    <i class="ri-information-line"></i>
                    <div class="text-start">${htmldata?.status}</div>
                  </div>
                </div>
              `;
            });
            // <div>${htmldata?.service_data?.service_name}</div>

          }
        },
        error: (err) => {
          appointment_arr = [];
          this.eventsarray = [];
          this.calendarOptions.events = [];
          this.shared.showAlert('error', 'Error', err.error.message);
        }
      })
    } else {
      const translatedErrorMsg = this.translate.instant('responses.please_select_location');
      this.shared.showAlert('error', 'Error', translatedErrorMsg);
    }
  }

  handleEventClick(arg: EventClickArg) {
    if (arg?.event?._def?.extendedProps['status'] != 'cancelled') {
      let id = arg?.event?._def?.extendedProps['_id'];
      Swal.fire({
        title: this.translate.instant('sweet_alert.are_you_sure'),
        text: this.translate.instant('sweet_alert.action_cannot_be_revert'),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#000",
        cancelButtonColor: "#d33",
        confirmButtonText: this.translate.instant('sweet_alert.cancel_appointment'),
        cancelButtonText: this.translate.instant('sweet_alert.cancel'),
      }).then((result) => {
        if (result.isConfirmed) {
          this.auth.patch('appointment', { id: id, status: 'cancelled' }).subscribe({
            next: (res: any) => {
              if (res.status == 200) {
                const translatedMsg = this.translate.instant('responses.appointment_cancelled_successfully');
                this.shared.showAlert('success', 'Successful', translatedMsg);
                this.getAppointments();
              }
            },
            error: (err) => {
              this.shared.showAlert('error', 'Error', err.error.message);
            }
          })
        }
      });
    }
  }
}
