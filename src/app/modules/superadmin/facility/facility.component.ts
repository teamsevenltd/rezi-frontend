import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { GeneralServiceService } from '../../../services/general-service.service';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-facility',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './facility.component.html',
  styleUrl: './facility.component.scss'
})
export class FacilityComponent implements OnInit {
  loginForm!: FormGroup;
  editFacility!: FormGroup;

  loading = false;
  submitted = false;

  getLoader = false;
  skeleton_arr = new Array(6);

  facility_arr: any = [];
  search = '';
  no = 0;
  size = 50;
  loadmore: boolean = true;
  load: boolean = true;
  loaded: number = 0;
  total = 0;

  status: string = 'all';
  otp_array = new Array(4);

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;
  @ViewChild('closeModal') closeModal!: ElementRef;

  constructor(private fb: FormBuilder, private auth: AuthService, private shared: GeneralServiceService, private router: Router, private translate: TranslateService) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      id: [''],
      pin: ['']
    })
    this.getFacility();
  }

  selectStatus(event: any) {
    this.status = event.target.value;
    this.resetsearch();
  }

  // to get facilites
  getFacility() {
    let endpoint = '';
    this.getLoader = true;
    this.load = true;
    this.loadmore = false;
    this.no++;
    if (this.search) {
      endpoint = 'facility?page=' + this.no + '&limit=' + this.size + '&facility_status=' + this.status + '&search=' + this.search
    }
    else {
      endpoint = 'facility?page=' + this.no + '&limit=' + this.size + '&facility_status=' + this.status
    }
    return new Promise((resolve) => {
      this.auth.get(endpoint).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.getLoader = false;
            if (this.no == 1) {
              this.facility_arr = res.data?.data;
              this.loaded = res.data?.data?.length;
            }
            else {
              for (let i = 0; i < res.data?.data?.length; i++) {
                this.facility_arr.push(res.data?.data[i]);
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
          this.shared.showAlert('error', 'Error', err.error.message);
          resolve(false);
        }
      })
    })
  }

  resetsearch() {
    this.no = 0;
    this.size = 50;
    this.total = 0;
    this.loaded = 0;
    this.facility_arr = []
    this.getFacility();
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

  facility_id: any;
  getFacilityID(id: any) {
    this.facility_id = id;
  }

  submitPin() {
    const otpString = this.otp_array.join('');
    this.loginForm.patchValue({ id: this.facility_id, pin: otpString })
    this.submitted = true;
    this.loading = true;
    if (this.loginForm.invalid) {
      this.loading = false;
    } else {
      this.auth.post('loginSuper', this.loginForm.value).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.loading = false;
            this.otp_array = Array(6).fill('');
            this.otpInputs.forEach(input => input.nativeElement.value = '');
            this.closeModal.nativeElement.click();
            this.shared.showAlert('success', 'Successful', res.message);
            this.submitted = false;
            localStorage.setItem('authtoken', JSON.stringify(res.token));
            localStorage.setItem('userdata', JSON.stringify(res.data));
            this.auth.validateToken();
            location.reload();
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

  // active/inactive the facility
  changeStatus(id: any, status: boolean) {
    let updated_status = !status;
    Swal.fire({
      title: this.translate.instant('sweet_alert.are_you_sure'),
      text: this.translate.instant('sweet_alert.action_can_be_revert'),
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#000000",
      cancelButtonColor: "#d33",
      confirmButtonText: this.translate.instant('sweet_alert.update'),
      cancelButtonText: this.translate.instant('sweet_alert.cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        let val = {
          id: id,
          status: updated_status
        }
        this.auth.patch('facility/status', val).subscribe({
          next: (res: any) => {
            if (res.status == 200) {
              this.shared.showAlert('success', 'Successful', res.message);
              this.resetsearch();
            }
          },
          error: (err) => {
            this.shared.showAlert('error', 'Error', err.error.message);
          }
        })
      }
    });
  }

  // delete facility
  deleteFacility(id: any) {
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
        this.auth.delete('facility/' + id, '').subscribe({
          next: (res: any) => {
            if (res.status == 200) {
              this.shared.showAlert('success', 'Successful', res.message);
              this.resetsearch();
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
