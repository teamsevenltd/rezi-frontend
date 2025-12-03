import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { GeneralServiceService } from '../../../services/general-service.service';
import Swal from 'sweetalert2';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-department',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './department.component.html',
  styleUrl: './department.component.scss'
})
export class DepartmentComponent implements OnInit {
  addDepartmentForm!: FormGroup;
  editDepartmentForm!: FormGroup;

  addTreatmentForm!: FormGroup;
  editTreatmentForm!: FormGroup;

  loading = false;
  submitted = false;

  getLoader = false;
  skeleton_arr = new Array(6);

  department_arr: any[] = [];
  search = '';
  no = 0;
  size = 50;
  loadmore: boolean = true;
  load: boolean = true;
  loaded: number = 0;
  total = 0;

  location_id: any;
  department_id: any;

  treatments_arr: any = [];
  isEdit = false;

  department: number = 0;
  status: boolean = true;

  @ViewChild('closeAddModal') closeAddModal!: ElementRef;
  @ViewChild('closeEditModal') closeEditModal!: ElementRef;

  @ViewChild('closeTreatmentModal') closeTreatmentModal!: ElementRef;

  constructor(private fb: FormBuilder, private auth: AuthService, private shared: GeneralServiceService, private translate: TranslateService) { }

  ngOnInit(): void {
    let userData = JSON.parse(localStorage.getItem('userdata') || '{}');
    if (Object.keys(userData).length > 0) {
      this.department = userData?.subscription?.subscription_plan_details?.department;
    }
    this.addDepartmentForm = this.fb.group({
      location_id: ['', Validators.required],
      name: ['', Validators.required]
    });
    this.editDepartmentForm = this.fb.group({
      id: [''],
      name: ['']
    });

    this.shared.location$.subscribe((location) => {
      this.location_id = location?._id;
      if (this.location_id) {
        this.addDepartmentForm.patchValue({ location_id: this.location_id })
      }
      this.resetsearch();
    });

    this.addTreatmentForm = this.fb.group({
      location_id: [''],
      department_id: [''],
      name: ['', Validators.required],
      duration: ['', Validators.required]
    });
    this.editTreatmentForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      duration: ['', Validators.required]
    });
  }

  // to save a department
  saveDepartment() {
    this.loading = true;
    this.submitted = true;
    if (this.addDepartmentForm.invalid) {
      this.loading = false;
    }
    else {
      this.auth.post('department', this.addDepartmentForm.value).subscribe({
        next: (res: any) => {
          if (res.status == 201) {
            this.loading = false;
            this.addDepartmentForm.reset();
            this.closeAddModal.nativeElement.click();
            const translatedMsg = this.translate.instant('responses.department_created_successfully');
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

  selectStatus(event: any) {
    this.status = event.target.value;
    this.resetsearch();
  }

  // to get all the departments
  getDepartments() {
    let endpoint = '';
    this.getLoader = true;
    this.load = true;
    this.loadmore = false;
    this.no++;
    if (this.search) {
      endpoint = 'department?location_id=' + this.location_id + '&page=' + this.no + '&limit=' + this.size + '&search=' + this.search
      // ?status=' + this.status
    }
    else {
      endpoint = 'department?location_id=' + this.location_id + '&page=' + this.no + '&limit=' + this.size
      // ?status=' + this.status
    }
    return new Promise((resolve) => {
      this.auth.get(endpoint).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.getLoader = false;
            if (this.no == 1) {
              this.department_arr = res.data?.data;
              this.loaded = res.data?.data.length;
            }
            else {
              for (let i = 0; i < res.data?.data.length; i++) {
                this.department_arr.push(res.data?.data[i]);
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
    this.department_arr = []
    this.getDepartments();
  }

  editDepartment(index: number) {
    let departmentdetail = this.department_arr[index];
    this.editDepartmentForm.patchValue({
      id: departmentdetail?._id,
      name: departmentdetail?.name
    })
  }

  updateDepartment() {
    this.loading = true;
    this.submitted = true;
    if (this.editDepartmentForm.invalid) {
      this.loading = false;
    }
    else {
      this.auth.patch('department', this.editDepartmentForm.value).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.loading = false;
            this.editDepartmentForm.reset();
            this.closeEditModal.nativeElement.click();
            const translatedMsg = this.translate.instant('responses.department_updated_successfully');
            this.shared.showAlert('success', 'Successful', translatedMsg);
            this.submitted = false;
          }
          this.resetsearch();
        },
        error: (err) => {
          this.loading = false;
          this.submitted = false;
          if (err.error.status === 404) {
            const translatedErrorMsg = this.translate.instant('responses.department_not_found');
            this.shared.showAlert('error', 'Error', translatedErrorMsg);
          } else {
            this.shared.showAlert('error', 'Error', err.error.message);
          }
        }
      })
    }
  }

  // delete a specific department
  deleteDepartment(id: any) {
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
        this.auth.delete('department/' + id, '').subscribe({
          next: (res: any) => {
            if (res.status == 200) {
              this.loading = false;
              const translatedMsg = this.translate.instant('responses.department_deleted_successfully');
              this.shared.showAlert('success', 'Successful', translatedMsg);
            }
            this.resetsearch()
          },
          error: (err) => {
            this.loading = false;
            if (err.error.status === 404) {
              const translatedErrorMsg = this.translate.instant('responses.department_not_found');
              this.shared.showAlert('error', 'Error', translatedErrorMsg);
            } else {
              this.shared.showAlert('error', 'Error', err.error.message);
            }
          }
        })
      }
    });
  }

  chooseDepartment(id: any) {
    this.department_id = id;
    this.reSet();
    this.getTreatments(id);
  }

  saveTreatment() {
    this.addTreatmentForm.patchValue({ location_id: this.location_id, department_id: this.department_id });
    this.loading = true;
    this.submitted = true;
    if (this.addTreatmentForm.invalid) {
      this.loading = false;
    }
    else {
      this.auth.post('treatment', this.addTreatmentForm.value).subscribe({
        next: (res: any) => {
          if (res.status == 201) {
            this.loading = false;
            this.addTreatmentForm.reset();
            this.closeTreatmentModal.nativeElement.click();
            const translatedMsg = this.translate.instant('responses.treatment_created_successfully');
            this.shared.showAlert('success', 'Successful', translatedMsg);
            this.submitted = false;
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

  getTreatments(id: any) {
    this.auth.get('treatment?department_id=' + id).subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.treatments_arr = res.data?.data;
        }
      },
      error: (err) => {
        // this.shared.showAlert('error', 'Error', err.error.message);
      }
    })
  }

  editTreatment(index: number) {
    this.isEdit = true;
    let treatment = this.treatments_arr[index];
    this.editTreatmentForm.patchValue({
      id: treatment?._id,
      name: treatment?.name,
      duration: treatment?.duration
    });
  }

  reSet() {
    this.editTreatmentForm.reset();
    this.isEdit = false;
  }

  updateTreatment() {
    this.loading = true;
    this.submitted = true;
    if (this.editTreatmentForm.invalid) {
      this.loading = false;
    }
    else {
      this.auth.patch('treatment', this.editTreatmentForm.value).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.loading = false;
            this.reSet();
            const translatedMsg = this.translate.instant('responses.treatment_updated_successfully');
            this.shared.showAlert('success', 'Successful', translatedMsg);
            this.submitted = false;
            this.closeTreatmentModal.nativeElement.click();
            this.getTreatments(this.department_id);
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

  deleteTreatment(id: any) {
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
        this.auth.delete('treatment/' + id, '').subscribe({
          next: (res: any) => {
            if (res.status == 200) {
              this.loading = false;
              const translatedMsg = this.translate.instant('responses.treatment_deleted_successfully');
              this.shared.showAlert('success', 'Successful', translatedMsg);
            }
            this.getTreatments(this.department_id)
          },
          error: (err) => {
            this.loading = false;
            this.shared.showAlert('error', 'Error', err.error.message);
          }
        })
      }
    });
  }

  changeStatus(id: any, status: boolean) {
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
        this.loading = true;
        let val = {
          id: id,
          status: !status
        }
        this.auth.patch('department/status', val).subscribe({
          next: (res: any) => {
            if (res.status == 200) {
              this.loading = false;
              const translatedMsg = this.translate.instant('responses.department_status_updated_successfully');
              this.shared.showAlert('success', 'Successful', translatedMsg);
            }
            this.resetsearch()
          },
          error: (err) => {
            this.loading = false;
            if (err.error.status === 404) {
              const translatedErrorMsg = this.translate.instant('responses.department_not_found');
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