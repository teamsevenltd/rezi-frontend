import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/auth.service';
import { GeneralServiceService } from '../../../services/general-service.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-setting',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, TranslateModule],
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent implements OnInit {
  profileForm!: FormGroup;
  addAvailability!: FormGroup;
  editAvailability!: FormGroup;

  loading = false;
  submitted = false;

  getLoader = false;
  skeleton_arr = new Array(6);

  user: any;
  picture: any;
  file: any = []

  stripe_key: any;
  sendgrid_mail: any;
  sendgrid_key: any;

  createProfile!: FormGroup;
  createAppSetting!: FormGroup;

  role: string = '';
  gallery_arr: any = [];

  selectedImagePath: any;
  choiceSelected: string = 'weekly';

  location_id: any;
  location_arr: any = [];

  availability_arr: any = [];

  weekdays = [
    { label: 'Monday', value: 'monday' },
    { label: 'Tuesday', value: 'tuesday' },
    { label: 'Wednesday', value: 'wednesday' },
    { label: 'Thursday', value: 'thursday' },
    { label: 'Friday', value: 'friday' },
    { label: 'Saturday', value: 'saturday' },
    { label: 'Sunday', value: 'sunday' },
  ]

  @ViewChild('closeModal') closeModal!: ElementRef;
  @ViewChild('closeAvailability') closeAvailability!: ElementRef;
  @ViewChild('closeEditAvailable') closeEditAvailable!: ElementRef;


  constructor(private fb: FormBuilder, private router: Router, public auth: AuthService, private shared: GeneralServiceService, private translate: TranslateService) {
    this.role = this.auth.userRole();
    this.shared.location$.subscribe((location) => {
      this.location_id = location?._id;
      if (this.role != 'superadmin' && this.location_id != undefined) {
        this.getAvailability();
      }
    });
  }

  ngOnInit(): void {
    this.role = this.auth.userRole();
    this.profileForm = this.fb.group({
      action: [''],
      file: [''],
      first_name: [''],
      last_name: [''],
      email: [''],
      role: [''],
      phone_number: [''],
      address: this.fb.group({
        street: [''],
        city: [''],
        country: [''],
        zip: [''],
      }),
      old_password: [''],
      new_password: ['']
    });
    this.addAvailability = this.fb.group({
      location_id: ['', Validators.required],
      weekday: ['', Validators.required],
      // start_date: [''],
      // end_date: [''],
      working_hours: this.fb.array([this.createWeeklyHours()]),
    });
    this.editAvailability = this.fb.group({
      id: [''],
      weekday: ['', Validators.required],
      working_hours: this.fb.array([]),
      status: ['']
    })
    this.createAppSetting = this.fb.group({
      key: [''],
      value: ['']
    })
    this.getProfile();
    if (this.role === 'superadmin') {
      this.getAppSettings();
    } else {
      this.getLocations();
      if (this.location_id !== undefined) {
        this.getAvailability();
      }
    }
  }

  getProfile() {
    this.loading = true;
    this.auth.get('user').subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.loading = false;
          this.user = res.data;
          this.profileForm.patchValue({
            first_name: this.user?.first_name,
            last_name: this.user?.last_name,
            email: this.user?.email,
            role: this.user?.role_id?.name,
            phone_number: this.user?.phone_number,
            address: {
              street: this.user?.address?.street,
              city: this.user?.address?.city,
              country: this.user?.address?.country,
              zip: this.user?.address?.zip,
            }
          });
        }
      },
      error: (err) => {
        this.loading = false;
        this.shared.showAlert('error', 'Error', err.error.message);
      }
    })
  }

  getAppSettings() {
    this.loading = true;
    this.auth.get('appsettings').subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.loading = false;
          this.sendgrid_mail = res?.data[0].value;
          this.sendgrid_key = res?.data[1].value;
          this.stripe_key = res?.data[2].value;
        }
      },
      error: (err) => {
        this.loading = false;
      }
    })
  }

  updateProfileImage(event: any) {
    this.file = event.target.files;
    if (this.file[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.picture = e.target.result;
      };
      reader.readAsDataURL(this.file[0]);
    }
    let formData = new FormData()
    formData.append('file', this.file[0])
    formData.append('action', 'ChangePicture')
    this.auth.patch('user/editprofile', formData).subscribe({
      next: (res: any) => {
        if (res.status === 200) {
          this.shared.showAlert('success', 'Successful', res.message)
        }
        this.getProfile();
        this.auth.validateToken();
      },
      error: (err) => {
        this.shared.showAlert('error', 'Error', err.error.message);
      }
    })
  }

  profileSubmit() {
    this.loading = true;
    this.submitted = true;
    if (this.profileForm.invalid) {
      this.loading = false;
    }
    else {
      this.auth.patch('user/editprofile', this.profileForm.value).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.loading = false;
            this.profileForm.reset();
            const translatedMsg = this.translate.instant('responses.profile_updated_successfully');
            this.shared.showAlert('success', 'Successful', translatedMsg);
            this.submitted = false;
          }
          this.getProfile();
          this.auth.validateToken();
        },
        error: (err) => {
          this.loading = false;
          this.submitted = false;
          this.shared.showAlert('error', 'Error', err.error.message);
        }
      })
    }
  }

  updatePassword() {
    this.profileForm.patchValue({ action: 'ChangePassword' });
    this.loading = true;
    this.submitted = true;
    if (this.profileForm.invalid) {
      this.loading = false;
    }
    else {
      this.auth.patch('user/editprofile', this.profileForm.value).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.loading = false;
            this.profileForm.reset();
            const translatedMsg = this.translate.instant('responses.password_updated_successfully');
            this.shared.showAlert('success', 'Successful', translatedMsg);
            this.submitted = false;
          }
          this.getProfile();
        },
        error: (err) => {
          this.loading = false;
          this.submitted = false;
          this.shared.showAlert('error', 'Error', err.error.message);
        }
      })
    }
  }

  onCreateAppSetting(): void {

  }

  chooseOption() {
    Swal.fire({
      title: this.translate.instant("app.avatar_question"),
      showDenyButton: true,
      confirmButtonText: this.translate.instant("app.avatar_gallery"),
      denyButtonText: this.translate.instant("app.location_device"),
    }).then((result) => {
      if (result.isConfirmed) {
        this.getAvatars();
      } else if (result.isDenied) {
        Swal.close()
        const fileInput: HTMLElement | null = document.getElementById('file');
        if (fileInput) {
          fileInput.click();
        }
      }
    });
  }

  openGalleryModal() {
    const modal = new (window as any).bootstrap.Modal(document.getElementById('galleryModal'));
    modal.show();
  }

  getAvatars() {
    this.openGalleryModal()
    this.getLoader = true;
    this.auth.get('avatar').subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.getLoader = false;
          this.gallery_arr = res.data;
        }
      },
      error: (err) => {
        this.getLoader = false;
      }
    })
  }

  selectImage(path: string) {
    this.selectedImagePath = path;
    let formData = new FormData()
    formData.append('file', path)
    formData.append('action', 'ChangePicture')
    this.auth.patch('user/editprofile', formData).subscribe({
      next: (res: any) => {
        if (res.status === 200) {
          this.closeModal.nativeElement.click();
          this.selectedImagePath = '';
          const translatedMsg = this.translate.instant('responses.profile_picture_updated_successfully');
          this.shared.showAlert('success', 'Successful', translatedMsg);
        }
        this.getProfile();
        this.auth.validateToken();
      },
      error: (err) => {
        this.shared.showAlert('error', 'Error', err.error.message);
      }
    })
  }

  otp_pin: any;
  generatePin() {
    this.auth.post('user/pin', '').subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.otp_pin = res.data;
          const translatedMsg = this.translate.instant('responses.pin_generated_successfully');
          this.shared.showAlert('success', 'Successful', translatedMsg);
        }
      },
      error: (err) => {
        this.shared.showAlert('error', 'Error', err.error.message);
      }
    })
  }

  getLocations() {
    this.auth.get('location?status=true').subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.location_arr = res.data?.data;
        }
      },
      error: (err) => {
        this.location_arr = [];
      }
    })
  }
  // changeChoice(chosen: string) {
  //   this.choiceSelected = chosen;
  // }
  createWeeklyHours(): FormGroup {
    return this.fb.group({
      opening_hours: ['', Validators.required],
      closing_hours: ['', Validators.required]
    });
  }
  get WeeklyHours(): FormArray {
    return this.addAvailability.get('working_hours') as FormArray;
  }
  addWeeklyHours(): void {
    this.WeeklyHours.push(this.createWeeklyHours());
  }
  submitAvailability() {
    this.loading = true;
    this.submitted = true;
    if (this.addAvailability.invalid) {
      this.loading = false;
    } else {
      this.auth.post('availability', this.addAvailability.value).subscribe({
        next: (res: any) => {
          if (res.status == 201) {
            this.loading = false;
            this.closeAvailability.nativeElement.click();
            this.reset();
            const translatedMsg = this.translate.instant('responses.availability_created_successfully');
            this.shared.showAlert('success', 'Successful', translatedMsg);
            this.submitted = false;
            this.getAvailability();
          }
        },
        error: (err) => {
          this.submitted = false;
          this.loading = false;
          this.shared.showAlert('error', 'Error', err.error.message);
        }
      })
    }
  }
  reset() {
    this.addAvailability.reset();
    this.WeeklyHours.clear();
  }

  getAvailability() {
    this.getLoader = true;
    this.auth.get('availability?location_id=' + this.location_id).subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.getLoader = false;
          this.availability_arr = res.data;
        }
      },
      error: (err) => {
        this.getLoader = false;
        this.shared.showAlert('error', 'Error', err.error.message);
      }
    })
  }
  sortedWorkingHours(working_array: any) {
    return working_array.sort((a: { opening_hours: string }, b: { opening_hours: string }) => {
      return a.opening_hours.localeCompare(b.opening_hours);
    });
  }

  patchWeeklyHours(): FormGroup {
    return this.fb.group({
      opening_hours: ['', Validators.required],
      closing_hours: ['', Validators.required]
    });
  }
  get updatedWeeklyHours(): FormArray {
    return this.editAvailability.get('working_hours') as FormArray;
  }
  updateWeeklyHours(): void {
    this.updatedWeeklyHours.push(this.patchWeeklyHours());
  }
  removeHours(i: number) {
    this.updatedWeeklyHours.removeAt(i);
  }
  editAvailable(index: number) {
    let hoursArray = this.editAvailability.get('working_hours') as FormArray;
    hoursArray.clear();
    let availability = this.availability_arr[index];
    this.editAvailability.patchValue({
      id: availability?._id,
      weekday: availability?.weekday,
      status: availability?.status
    });
    availability?.working_hours.forEach((element: any) => {
      hoursArray.push(this.fb.group({
        opening_hours: element?.opening_hours,
        closing_hours: element?.closing_hours
      }))
    });
  }
  updateAvailability() {
    this.loading = true;
    this.submitted = true;
    if (this.editAvailability.invalid) {
      this.loading = false;
    } else {
      this.auth.patch('availability', this.editAvailability.value).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.loading = false;
            this.closeEditAvailable.nativeElement.click();
            this.editAvailability.reset();
            this.updatedWeeklyHours.clear();
            const translatedMsg = this.translate.instant('responses.availability_updated_successfully');
            this.shared.showAlert('success', 'Successful', translatedMsg);
            this.submitted = false;
            this.getAvailability();
          }
        },
        error: (err) => {
          this.submitted = false;
          this.loading = false;
          this.shared.showAlert('error', 'Error', err.error.message);
        }
      })
    }
  }

  deleteAvailability(id: any) {
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
        this.loading = true;
        this.auth.delete('availability/' + id, '').subscribe({
          next: (res: any) => {
            if (res.status == 200) {
              this.loading = false;
              const translatedMsg = this.translate.instant('responses.availability_deleted_successfully');
              this.shared.showAlert('success', 'Successful', translatedMsg);
            }
            this.getAvailability()
          },
          error: (err) => {
            this.loading = false;
            this.shared.showAlert('error', 'Error', err.error.message);
          }
        })
      }
    });
  }
}
