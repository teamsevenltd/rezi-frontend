import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../../auth/auth.service';
import { GeneralServiceService } from '../../../services/general-service.service';
import Swal from 'sweetalert2';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, RouterModule],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.scss'
})

export class PatientsComponent implements OnInit {
  addPatientForm!: FormGroup;
  editPatientForm!: FormGroup;

  loading = false;
  submitted = false;

  patient_arr: any[] = [];
  search = '';
  no = 0;
  size = 50;
  loadmore: boolean = true;
  load: boolean = true;
  loaded: number = 0;
  total = 0;

  getLoader = false;
  skeleton_arr = new Array(6);

  @ViewChild('closeAddModal') closeAddModal!: ElementRef;
  @ViewChild('closeEditModal') closeEditModal!: ElementRef;

  constructor(private fb: FormBuilder, private auth: AuthService, private shared: GeneralServiceService, private translate: TranslateService) { }

  ngOnInit(): void {
    this.addPatientForm = this.fb.group({
      first_name: [''],
      last_name: [''],
      date_of_birth: [''],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      insurance: ['', Validators.required]
    });
    this.editPatientForm = this.fb.group({
      id: [''],
      first_name: [''],
      last_name: [''],
      date_of_birth: [''],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      insurance: ['', Validators.required]
    })
    this.getPatients();
  }

  savePatient() {
    this.loading = true;
    this.submitted = true;
    if (this.addPatientForm.invalid) {
      this.loading = false;
    }
    else {
      this.auth.post('patient', this.addPatientForm.value).subscribe({
        next: (res: any) => {
          if (res.status == 201) {
            this.loading = false;
            this.addPatientForm.reset();
            this.closeAddModal.nativeElement.click();
            const translatedMsg = this.translate.instant('responses.patient_created_successfully');
            this.shared.showAlert('success', 'Successful', translatedMsg);
            this.submitted = false;
          }
          this.resetsearch();
        },
        error: (err) => {
          this.loading = false;
          this.submitted = false;
          this.shared.showAlert('error', 'Error', err.error.message);
        }
      })
    }
  }

  getPatients() {
    let endpoint = '';
    this.getLoader = true;
    this.load = true;
    this.loadmore = false;
    this.no++;
    if (this.search) {
      endpoint = 'patient?page=' + this.no + '&limit=' + this.size + '&search=' + this.search
    }
    else {
      endpoint = 'patient?page=' + this.no + '&limit=' + this.size
    }
    return new Promise((resolve) => {
      this.auth.get(endpoint).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.getLoader = false;
            if (this.no == 1) {
              this.patient_arr = res.data?.data;
              this.loaded = res.data?.data.length;
            }
            else {
              for (let i = 0; i < res.data?.data.length; i++) {
                this.patient_arr.push(res.data?.data[i]);
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
    this.size = 50;
    this.total = 0;
    this.loaded = 0;
    this.patient_arr = []
    this.getPatients();
  }

  editPatient(index: number) {
    let patient = this.patient_arr[index];
    this.editPatientForm.patchValue({
      id: patient?._id,
      first_name: patient?.first_name,
      last_name: patient?.last_name,
      date_of_birth: patient?.date_of_birth,
      phone: patient?.phone,
      email: patient?.email,
      insurance: patient?.insurance
    });
  }

  updatePatient() {
    this.loading = true;
    this.submitted = true;
    if (this.editPatientForm.invalid) {
      this.loading = false;
    }
    else {
      this.auth.patch('patient', this.editPatientForm.value).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.loading = false;
            this.editPatientForm.reset();
            this.closeEditModal.nativeElement.click();
            const translatedMsg = this.translate.instant('responses.patient_updated_successfully');
            this.shared.showAlert('success', 'Successful', translatedMsg);
            this.submitted = false;
          }
          this.resetsearch();
        },
        error: (err) => {
          this.loading = false;
          this.submitted = false;
          if (err.error.status === 404) {
            const translatedErrorMsg = this.translate.instant('responses.patient_does_not_exist');
            this.shared.showAlert('error', 'Error', translatedErrorMsg);
          } else {
            this.shared.showAlert('error', 'Error', err.error.message);
          }
        }
      })
    }
  }

  deletePatient(id: any) {
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
        this.auth.delete('patient/' + id, '').subscribe({
          next: (res: any) => {
            if (res.status == 200) {
              this.loading = false;
              const translatedMsg = this.translate.instant('responses.patient_deleted_successfully');
              this.shared.showAlert('success', 'Successful', translatedMsg);
            }
            this.resetsearch()
          },
          error: (err) => {
            this.loading = false;
            if (err.error.status === 404) {
              const translatedErrorMsg = this.translate.instant('responses.patient_does_not_exist');
              this.shared.showAlert('error', 'Error', translatedErrorMsg);
            } else {
              this.shared.showAlert('error', 'Error', err.error.message);
            }
          }
        })
      }
    });
  }
}
