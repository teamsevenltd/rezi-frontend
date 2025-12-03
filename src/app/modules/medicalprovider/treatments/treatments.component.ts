import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../auth/auth.service';
import { GeneralServiceService } from '../../../services/general-service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-treatments',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './treatments.component.html',
  styleUrl: './treatments.component.scss'
})
export class TreatmentsComponent implements OnInit {

  addTreatmentForm!: FormGroup;
  editTreatmentForm!: FormGroup;

  loading = false;
  submitted = false;

  getLoader = false;
  skeleton_arr = new Array(6);

  location_id: any;

  treatments_arr: any[] = [];
  search = '';
  no = 0;
  size = 50;
  loadmore: boolean = true;
  load: boolean = true;
  loaded: number = 0;
  total = 0;

  @ViewChild('closeAddModal') closeAddModal!: ElementRef;
  @ViewChild('closeEditModal') closeEditModal!: ElementRef;

  constructor(private fb: FormBuilder, private auth: AuthService, private shared: GeneralServiceService, private translate: TranslateService) { }

  ngOnInit(): void {
    this.addTreatmentForm = this.fb.group({
      location_id: ['', Validators.required],
      name: ['', Validators.required],
      duration: ['', Validators.required]
    });
    this.editTreatmentForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      duration: ['', Validators.required]
    });
    this.shared.location$.subscribe((location) => {
      this.location_id = location?._id;
      if (this.location_id) {
        this.addTreatmentForm.patchValue({ location_id: this.location_id })
      }
      this.resetsearch();
    });
  }

  saveTreatment() {
    this.loading = true;
    this.submitted = true;
    if (this.addTreatmentForm.invalid) {
      this.loading = false;
    } else {
      this.auth.post('treatment', this.addTreatmentForm.value).subscribe({
        next: (res: any) => {
          if (res.status == 201) {
            this.loading = false;
            this.addTreatmentForm.reset();
            this.closeAddModal.nativeElement.click();
            const translatedMsg = this.translate.instant('responses.treatment_created_successfully');
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

  getTreatments() {
    let endpoint = '';
    this.getLoader = true;
    this.load = true;
    this.loadmore = false;
    this.no++;
    if (this.search) {
      endpoint = 'treatment?location_id=' + this.location_id + '&page_no=' + this.no + '&limit=' + this.size + '&search=' + this.search
    }
    else {
      endpoint = 'treatment?location_id=' + this.location_id + '&page_no=' + this.no + '&limit=' + this.size
    }
    return new Promise((resolve) => {
      this.auth.get(endpoint).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.getLoader = false;
            if (this.no == 1) {
              this.treatments_arr = res.data?.data;
              this.loaded = res.data?.data.length;
            }
            else {
              for (let i = 0; i < res.data?.data.length; i++) {
                this.treatments_arr.push(res.data?.data[i]);
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
    this.treatments_arr = []
    this.getTreatments();
  }

  editTreatment(index: number) {
    let treatment = this.treatments_arr[index];
    this.editTreatmentForm.patchValue({
      id: treatment?._id,
      name: treatment?.name,
      duration: treatment?.duration
    })
  }

  updateTreatment() {
    this.loading = true;
    this.submitted = true;
    if (this.editTreatmentForm.invalid) {
      this.loading = false;
    } else {
      this.auth.patch('treatment', this.editTreatmentForm.value).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.loading = false;
            this.editTreatmentForm.reset();
            this.closeEditModal.nativeElement.click();
            const translatedMsg = this.translate.instant('responses.treatment_updated_successfully');
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
            this.resetsearch()
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
