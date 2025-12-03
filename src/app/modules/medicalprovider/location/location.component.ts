import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { GeneralServiceService } from '../../../services/general-service.service';
import Swal from 'sweetalert2';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, GoogleMapsModule],
  templateUrl: './location.component.html',
  styleUrl: './location.component.scss'
})
export class LocationComponent implements OnInit {
  addLocationForm!: FormGroup;
  editLocationForm!: FormGroup;

  mapCenter = { lat: 52.520008, lng: 13.404954 };
  markerPosition!: google.maps.LatLngLiteral;
  zoom = 12;

  loading = false;
  submitted = false;

  location_arr: any[] = [];
  search = '';
  no = 0;
  size = 50;
  loadmore: boolean = true;
  load: boolean = true;
  loaded: number = 0;
  total = 0;

  getLoader = false;
  skeleton_arr = new Array(6);

  location: number = 0;
  status: boolean = true;

  @ViewChild('closeAddModal') closeAddModal!: ElementRef;
  @ViewChild('closeEditModal') closeEditModal!: ElementRef;

  suggestionlist!: any;
  autocompleteService!: google.maps.places.AutocompleteService;
  placesService!: google.maps.places.PlacesService;

  constructor(private fb: FormBuilder, private auth: AuthService, private shared: GeneralServiceService, private ngz: NgZone, private translate: TranslateService
  ) { }

  ngOnInit(): void {
    let userData = JSON.parse(localStorage.getItem('userdata') || '{}');
    this.autocompleteService = new google.maps.places.AutocompleteService();
    let div = document.createElement('div');
    this.placesService = new google.maps.places.PlacesService(div);
    if (Object.keys(userData).length > 0) {
      this.location = userData?.subscription?.subscription_plan_details?.location;
    }
    this.addLocationForm = this.fb.group({
      location_name: ['', Validators.required],
      primary_email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      city: [''],
      state: [''],
      zip_code: [''],
      location: this.fb.group({
        longitude: [''],
        latitude: ['']
      }),
      visibility: false,
      send_files: false,
      statutory_health_insurance: false,
      private_health_insurance: false,
      self_insurance: false,
      bg_insurance: false,
      secondary_email_notifications: false,
      secondary_email: [''],
      show_holidays_calendar: false,
      restrict_appointments_on_holidays: false,
    });
    this.editLocationForm = this.fb.group({
      id: [''],
      // relocation: [''],
      // parent_location_id: [''],
      location_name: ['', Validators.required],
      primary_email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      city: [''],
      state: [''],
      zip_code: [''],
      location: this.fb.group({
        longitude: [''],
        latitude: ['']
      }),
      visibility: [''],
      send_files: [''],
      statutory_health_insurance: [''],
      private_health_insurance: [''],
      self_insurance: [''],
      bg_insurance: [''],
      secondary_email_notifications: [''],
      secondary_email: [''],
      show_holidays_calendar: [''],
      restrict_appointments_on_holidays: [''],
    })
    this.getLocations();
  }

  OnInputChange(event: any) {
    const input = (event.target as HTMLInputElement).value;
    if (input.length > 2 && this.autocompleteService) {
      this.autocompleteService.getPlacePredictions({ input }, (predictions, status) => {
        this.ngz.run(() => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            this.suggestionlist = predictions;
          } else {
            this.suggestionlist = [];
          }
        });
      });
    } else {
      this.suggestionlist = [];
    }
  }

  getPlacedetails(event: any, cat: string) {
    let placeId = event.target.value;
    if (placeId) {
      this.placesService.getDetails({ placeId: placeId }, (place, status) => {
        this.ngz.run(() => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            if (cat == 'new') {
              this.addLocationForm.patchValue({
                address: place?.name,
                city: this.getAddressComponent(place, 'locality'),
                state: this.getAddressComponent(place, 'administrative_area_level_1'),
                zip_code: this.getAddressComponent(place, 'postal_code')
              });
            }
            else if (cat == 'edit') {
              this.editLocationForm.patchValue({
                address: place?.name,
                city: this.getAddressComponent(place, 'locality'),
                state: this.getAddressComponent(place, 'administrative_area_level_1'),
                zip_code: this.getAddressComponent(place, 'postal_code')
              });
            }
            const location = place.geometry?.location;
            const coordinates = {
              lat: location?.lat(),
              lng: location?.lng()
            };
            if (cat == 'new') {
              this.addLocationForm.patchValue({
                location: { longitude: coordinates.lng, latitude: coordinates.lat }
              });
            }
            else if (cat == 'edit') {
              this.editLocationForm.patchValue({
                location: { longitude: coordinates.lng, latitude: coordinates.lat }
              });
            }
            this.mapCenter = {
              lat: coordinates.lat as number,
              lng: coordinates.lng as number
            };
            this.markerPosition = this.mapCenter
          }
        });
      });
    }
  }

  getAddressComponent(place: google.maps.places.PlaceResult, type: string): string {
    const component = place.address_components?.find(c => c.types.includes(type));
    return component ? component.long_name : '';
  }

  // add location form submit
  submitAddForm() {
    this.loading = true;
    this.submitted = true;
    if (this.addLocationForm.invalid) {
      this.loading = false;
    }
    else {
      this.auth.post('location', this.addLocationForm.value).subscribe({
        next: (res: any) => {
          if (res.status == 201) {
            this.loading = false;
            this.addLocationForm.reset();
            this.closeAddModal.nativeElement.click();
            const translatedMsg = this.translate.instant('responses.location_created_successfully');
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

  getLocations() {
    let endpoint = '';
    this.getLoader = true;
    this.load = true;
    this.loadmore = false;
    this.no++;
    if (this.search) {
      endpoint = 'location?status=' + this.status + '&page=' + this.no + '&limit=' + this.size + '&search=' + this.search
    }
    else {
      endpoint = 'location?status=' + this.status + '&page=' + this.no + '&limit=' + this.size
    }
    return new Promise((resolve) => {
      this.auth.get(endpoint).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.getLoader = false;
            if (this.no == 1) {
              this.location_arr = res.data?.data;
              this.loaded = res.data?.data.length;
            }
            else {
              for (let i = 0; i < res.data?.data.length; i++) {
                this.location_arr.push(res.data?.data[i]);
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
    this.location_arr = []
    this.getLocations();
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
        this.auth.patch('location/status', val).subscribe({
          next: (res: any) => {
            if (res.status == 200) {
              this.loading = false;
              const translatedMsg = this.translate.instant('responses.location_status_updated_successfully');
              this.shared.showAlert('success', 'Successful', translatedMsg);
            }
            this.resetsearch()
          },
          error: (err) => {
            this.loading = false;
            if (err.error.status === 404) {
              const translatedErrorMsg = this.translate.instant('responses.location_not_found');
              this.shared.showAlert('error', 'Error', translatedErrorMsg);
            } else {
              this.shared.showAlert('error', 'Error', err.error.message);
            }
          }
        })
      }
    });
  }

  editLocation(index: number) {
    let location = this.location_arr[index];
    this.editLocationForm.patchValue({
      id: location?._id,
      location_name: location?.location_name,
      primary_email: location?.primary_email,
      address: location?.address,
      city: location?.city,
      state: location?.state,
      zip_code: location?.zip_code,
      visibility: location?.visibility,
      send_files: location?.send_files,
      statutory_health_insurance: location?.statutory_health_insurance,
      private_health_insurance: location?.private_health_insurance,
      self_insurance: location?.self_insurance,
      bg_insurance: location?.bg_insurance,
      secondary_email_notifications: location?.secondary_email_notifications,
      secondary_email: location?.secondary_email,
      show_holidays_calendar: location?.show_holidays_calendar,
      restrict_appointments_on_holidays: location?.restrict_appointments_on_holidays,
    });

    this.mapCenter = {
      lat: location?.location?.latitude as number,
      lng: location?.location?.longitude as number
    };
    this.markerPosition = this.mapCenter;
  }

  updateLocation() {
    this.loading = true;
    this.submitted = true;
    if (this.editLocationForm.invalid) {
      this.loading = false;
    }
    else {
      this.auth.patch('location', this.editLocationForm.value).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.loading = false;
            this.editLocationForm.reset();
            this.closeEditModal.nativeElement.click();
            const translatedMsg = this.translate.instant('responses.locaion_updated_successfully');
            this.shared.showAlert('success', 'Successful', translatedMsg);
            this.submitted = false;
          }
          this.resetsearch();
        },
        error: (err) => {
          this.loading = false;
          this.submitted = false;
          if (err.error.status === 404) {
            const translatedErrorMsg = this.translate.instant('responses.location_not_found');
            this.shared.showAlert('error', 'Error', translatedErrorMsg);
          } else {
            this.shared.showAlert('error', 'Error', err.error.message);
          }
        }
      })
    }
  }

  deleteLocation(id: any) {
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
        this.auth.delete('location/' + id, '').subscribe({
          next: (res: any) => {
            if (res.status == 200) {
              this.loading = false;
              const translatedMsg = this.translate.instant('responses.location_deleted_successfully');
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