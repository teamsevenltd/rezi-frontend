import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, FormArray, FormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { GeneralServiceService } from '../../../services/general-service.service';
import Swal from 'sweetalert2';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent {
  addServiceForm!: FormGroup;
  editServiceForm!: FormGroup;

  loading = false;
  submitted = false;

  service_arr: any[] = [];
  search = '';
  no = 0;
  size = 50;
  loadmore: boolean = true;
  load: boolean = true;
  loaded: number = 0;
  total = 0;

  getLoader = false;
  locationLoader = false;
  skeleton_arr = new Array(6);

  location_id: any;
  location_arr: any = [];
  location_obj: any;

  selectedIcon: string = '';

  selectedLang: string = '';

  @ViewChild('closeViewModal') closeViewModal!: ElementRef;
  @ViewChild('closeAddModal') closeAddModal!: ElementRef;
  @ViewChild('closeEditModal') closeEditModal!: ElementRef;
  @ViewChild('closeVisibilityModal') closeVisibilityModal!: ElementRef;

  iconArray = [
    {
      "value": "ri-heart-line",
    },
    {
      "value": "ri-heart-fill",
    },
    {
      "value": "ri-heart-2-line",
    },
    {
      "value": "ri-heart-2-fill",
    },
    {
      "value": "ri-heart-3-line",
    },
    {
      "value": "ri-heart-3-fill",
    },
    {
      "value": "ri-heart-add-line",
    },
    {
      "value": "ri-heart-add-fill",
    },
    {
      "value": "ri-heart-add-2-line",
    },
    {
      "value": "ri-heart-add-2-fill",
    },
    {
      "value": "ri-dislike-line",
    },
    {
      "value": "ri-dislike-fill",
    },
    {
      "value": "ri-hearts-line",
    },
    {
      "value": "ri-hearts-fill",
    },
    {
      "value": "ri-heart-pulse-line",
    },
    {
      "value": "ri-heart-pulse-fill",
    },
    {
      "value": "ri-pulse-line",
    },
    {
      "value": "ri-pulse-fill",
    },
    {
      "value": "ri-pulse-ai-line",
    },
    {
      "value": "ri-pulse-ai-fill",
    },
    {
      "value": "ri-empathize-line",
    },
    {
      "value": "ri-empathize-fill",
    },
    {
      "value": "ri-nurse-line",
    },
    {
      "value": "ri-nurse-fill",
    },
    {
      "value": "ri-dossier-line",
    },
    {
      "value": "ri-dossier-fill",
    },
    {
      "value": "ri-health-book-line",
    },
    {
      "value": "ri-health-book-fill",
    },
    {
      "value": "ri-first-aid-kit-line",
    },
    {
      "value": "ri-first-aid-kit-fill",
    },
    {
      "value": "ri-capsule-line",
    },
    {
      "value": "ri-capsule-fill",
    },
    {
      "value": "ri-medicine-bottle-line",
    },
    {
      "value": "ri-medicine-bottle-fill",
    },
    {
      "value": "ri-flask-line",
    },
    {
      "value": "ri-flask-fill",
    },
    {
      "value": "ri-test-tube-line",
    },
    {
      "value": "ri-test-tube-fill",
    },
    {
      "value": "ri-dropper-line",
    },
    {
      "value": "ri-dropper-fill",
    },
    {
      "value": "ri-microscope-line",
    },
    {
      "value": "ri-microscope-fill",
    },
    {
      "value": "ri-hand-sanitizer-line",
    },
    {
      "value": "ri-hand-sanitizer-fill",
    },
    {
      "value": "ri-mental-health-line",
    },
    {
      "value": "ri-mental-health-fill",
    },
    {
      "value": "ri-psychotherapy-line",
    },
    {
      "value": "ri-psychotherapy-fill",
    },
    {
      "value": "ri-stethoscope-line",
    },
    {
      "value": "ri-stethoscope-fill",
    },
    {
      "value": "ri-syringe-line",
    },
    {
      "value": "ri-syringe-fill",
    },
    {
      "value": "ri-thermometer-line",
    },
    {
      "value": "ri-thermometer-fill",
    },
    {
      "value": "ri-infrared-thermometer-line",
    },
    {
      "value": "ri-infrared-thermometer-fill",
    },
    {
      "value": "ri-surgical-mask-line",
    },
    {
      "value": "ri-surgical-mask-fill",
    },
    {
      "value": "ri-virus-line",
    },
    {
      "value": "ri-virus-fill",
    },
    {
      "value": "ri-lungs-line",
    },
    {
      "value": "ri-lungs-fill",
    },
    {
      "value": "ri-rest-time-line",
    },
    {
      "value": "ri-rest-time-fill",
    },
    {
      "value": "ri-zzz-line",
    },
    {
      "value": "ri-zzz-fill",
    },
    {
      "value": "ri-brain-line",
    },
    {
      "value": "ri-brain-fill",
    },
    {
      "value": "ri-brain-2-line",
    },
    {
      "value": "ri-brain-2-fill",
    },
    {
      "value": "ri-aed-line",
    },
    {
      "value": "ri-aed-fill",
    },
    {
      "value": "ri-aed-electrodes-line",
    },
    {
      "value": "ri-aed-electrodes-fill",
    },
    {
      "value": "ri-dna-line",
    },
    {
      "value": "ri-dna-fill",
    },
    {
      "value": "ri-facebook-line",
    },
    {
      "value": "ri-facebook-fill",
    },
    {
      "value": "ri-facebook-circle-line",
    },
    {
      "value": "ri-facebook-circle-fill",
    },
    {
      "value": "ri-instagram-line",
    },
    {
      "value": "ri-instagram-fill",
    },
    {
      "value": "ri-linkedin-line",
    },
    {
      "value": "ri-linkedin-fill",
    },
    {
      "value": "ri-twitter-line",
    },
    {
      "value": "ri-twitter-fill",
    },

  ]

  predefinedServices: any = {
    termin: {
      en: 'Appointment Service',
      de: 'Termin Standardeinstellung',
      description: {
        en: 'Predefined appointment service',
        de: 'Vordefinierter Terminservice'
      }
    }
  };

  constructor(private fb: FormBuilder, private auth: AuthService, private shared: GeneralServiceService, private router: Router, private translate: TranslateService, private cdr: ChangeDetectorRef) {
    this.shared.language$.subscribe((lang: string) => {
      this.selectedLang = lang.replace(/"/g, '');
      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    let lang = localStorage.getItem('system_lang') || 'de';
    this.selectedLang = lang.replace(/"/g, '');

    this.addServiceForm = this.fb.group({
      service_name: ['', Validators.required],
      service_description: ['', Validators.required],
      icon_class: [''],
      icon_color: [''],
      locations_id: this.fb.array([])
    })
    this.editServiceForm = this.fb.group({
      id: [''],
      visibility: [true],
      service_name: [''],
      service_description: ['']
    })
    this.shared.location$.subscribe((location) => {
      this.location_obj = location;
      this.location_id = location?._id;
      if (this.location_id) {
        this.resetsearch();
      }
    })
    if (!this.location_id) {
      setTimeout(() => {
        this.openModal();
      }, 5100);
    }
    this.getLocation();
  }

  openModal() {
    const modal = new (window as any).bootstrap.Modal(document.getElementById('selectLocation'));
    modal.show();
  }
  closeModal() {
    const modalElement = document.getElementById('selectLocation');
    const modal = new (window as any).bootstrap.Modal(modalElement);
    modal.hide();
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.classList.remove('fade');
      backdrop.remove();
    }
  }

  getLocation() {
    this.locationLoader = true;
    this.getLoader = true;
    this.auth.get('location?status=true').subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.locationLoader = false;
          this.location_arr = res.data?.data;
        }
        let locationArray = this.addServiceForm.get('locations_id') as FormArray;
        locationArray.clear();
        for (let i = 0; i < this.location_arr?.length; i++) {
          locationArray.push(this.fb.control(this.location_arr[i]?._id))
        }
      },
      error: (err) => {
        this.locationLoader = false;
        this.closeModal();
        this.router.navigate(['/medicalprovider/locations'])
      }
    })
  }

  selectLocation(obj: any) {
    this.shared.updateLocation(obj)
    this.location_id = obj?._id;
    this.resetsearch();
    this.closeViewModal.nativeElement.click();
  }

  selectIcon(iconClass: any) {
    this.selectedIcon = iconClass;
    this.addServiceForm.patchValue({
      icon_class: iconClass
    });
  }
  selectColor(event: any) {
    this.addServiceForm.patchValue({ icon_color: event.target.value })
  }
  locationsChecked(event: any) {
    let locationId = event.target.value;
    let locationArray = this.addServiceForm.get('locations_id') as FormArray;
    let index = locationArray.value.indexOf(locationId);
    if (index > -1) {
      locationArray.removeAt(index);
    } else {
      locationArray.push(this.fb.control(locationId));
    }
  }

  // add Service form submit
  submitAddForm() {
    this.loading = true;
    this.submitted = true;
    if (this.addServiceForm.invalid) {
      this.loading = false;
    }
    else {
      this.auth.post('service', this.addServiceForm.value).subscribe({
        next: (res: any) => {
          if (res.status == 201) {
            this.loading = false;
            this.closeAddModal.nativeElement.click();
            this.addServiceForm.reset();
            const translatedMsg = this.translate.instant('responses.service_created_successfully');
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

  getServices() {
    let endpoint = '';
    this.getLoader = true;
    this.load = true;
    this.loadmore = false;
    this.no++;
    if (this.search) {
      endpoint = 'service?location_id=' + this.location_id + '&page=' + this.no + '&limit=' + this.size + '&search=' + this.search
    }
    else {
      endpoint = 'service?location_id=' + this.location_id + '&page=' + this.no + '&limit=' + this.size
    }
    // + '&action=' + true
    return new Promise((resolve) => {
      this.auth.get(endpoint).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.getLoader = false;
            if (this.no == 1) {
              this.service_arr = res.data?.data;
              this.loaded = res.data?.data.length;
            }
            else {
              for (let i = 0; i < res.data?.data.length; i++) {
                this.service_arr.push(res.data?.data[i]);
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
  getServiceName(item: any): string {
    if (item?.is_predefined && this.predefinedServices[item.service_name]) {
      return this.predefinedServices[item.service_name][this.selectedLang] || item.service_name;
    }
    return item?.service_name;
  }
  getServiceDescription(item: any): string {
    if (item?.is_predefined && this.predefinedServices[item.service_name]) {
      const descObj = this.predefinedServices[item.service_name].description;
      return descObj?.[this.selectedLang] || item.service_description;
    }
    return item?.service_description;
  }

  resetsearch() {
    this.no = 0;
    this.size = 50;
    this.total = 0;
    this.loaded = 0;
    this.service_arr = []
    this.getServices();
  }

  get activeServices() {
    return this.service_arr?.filter(s => s.visibility) ?? [];
  }

  get inactiveServices() {
    return this.service_arr?.filter(s => !s.visibility) ?? [];
  }

  isPredefined: boolean = false;
  editService(index: number) {
    let service = this.service_arr[index];
    this.isPredefined = service?.is_predefined;
    this.editServiceForm.patchValue({
      id: service?._id,
      visibility: service?.visibility,
      service_name: service?.service_name,
      service_description: service?.service_description,
    });
  }

  updateVisbility(id: any, name: string, description: string, visibility: boolean) {
    this.loading = true;
    let updated_visbility = !visibility;
    this.editServiceForm.patchValue({
      id: id,
      visibility: updated_visbility,
      service_name: name,
      service_description: description,
    });
    this.auth.patch('service', this.editServiceForm.value).subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.loading = false;
          const translatedMsg = this.translate.instant('responses.service_updated_successfully');
          this.shared.showAlert('success', 'Successful', translatedMsg);
        }
        this.resetsearch();
      },
      error: (err) => {
        this.loading = false;
        if (err.error.status === 404) {
          const translatedErrorMsg = this.translate.instant('responses.service_not_found');
          this.shared.showAlert('error', 'Error', translatedErrorMsg);
        } else {
          this.shared.showAlert('error', 'Error', err.error.message);
        }
      }
    })
  }

  // update Service form submit
  updateService() {
    this.loading = true;
    this.submitted = true;
    if (this.editServiceForm.invalid) {
      this.loading = false;
    }
    else {
      this.auth.patch('service', this.editServiceForm.value).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.loading = false;
            this.editServiceForm.reset();
            this.closeEditModal.nativeElement.click();
            this.closeVisibilityModal.nativeElement.click();
            const translatedMsg = this.translate.instant('responses.service_updated_successfully');
            this.shared.showAlert('success', 'Successful', translatedMsg);
            this.isPredefined = false;
            this.submitted = false;
          }
          this.resetsearch();
        },
        error: (err) => {
          this.loading = false;
          this.submitted = false;
          if (err.error.status === 404) {
            const translatedErrorMsg = this.translate.instant('responses.service_not_found');
            this.shared.showAlert('error', 'Error', translatedErrorMsg);
          } else {
            this.shared.showAlert('error', 'Error', err.error.message);
          }
        }
      })
    }
  }

  deleteService(id: any) {
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
        this.auth.delete('service/' + id, '').subscribe({
          next: (res: any) => {
            if (res.status == 200) {
              this.loading = false;
              const translatedMsg = this.translate.instant('responses.service_deleted_successfully');
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

  addSteps(serviceId: any) {
    // this.router.navigate(['/medicalprovider/services'], { queryParams: {id: serviceId}});
    this.router.navigate(['/medicalprovider/services/' + serviceId]);
  }

  // stepbtn:boolean=false;
  // steps:any[]=[];
  // clickbtn(): void {
  //   this.steps.push({id: this.steps.length + 1 }); 
  //   if (!this.stepbtn) {
  //     this.stepbtn = true;
  //   }
  // }
}
