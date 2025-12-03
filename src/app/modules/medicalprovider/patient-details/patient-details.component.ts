import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../auth/auth.service';
import { GeneralServiceService } from '../../../services/general-service.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-patient-details',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './patient-details.component.html',
  styleUrl: './patient-details.component.scss'
})
export class PatientDetailsComponent implements OnInit {
  patientId: any;

  requestLoader = false;
  appointmentsLoader = false;
  skeleton_arr = new Array(6);

  selectedTab: string = 'request';
  showChat = false;
  user_details: any;
  chat_details: any;
  request_arr: any[] = [];

  appointment_arr: any[] = [];
  search = '';
  no = 0;
  size = 50;
  loadmore: boolean = true;
  load: boolean = true;
  loaded: number = 0;
  total = 0;

  requestSearch = '';
  requestno = 0;
  requestsize = 10;
  requestloadmore: boolean = true;
  requestload: boolean = true;
  requestloaded: number = 0;
  requesttotal = 0;

  selectedLang: string = '';
 predefinedServices: any = {
    termin: {
      en: 'Appointment Service',
      de: 'Termin Standardeinstellung'
    }
  };

  constructor(private fb: FormBuilder, private auth: AuthService, public shared: GeneralServiceService, private route: ActivatedRoute, private cdr: ChangeDetectorRef) {
    this.shared.language$.subscribe((lang: string) => {
      this.selectedLang = lang.replace(/"/g, '');
      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    let lang = localStorage.getItem('system_lang') || 'de';
    this.selectedLang = lang.replace(/"/g, '');

    this.patientId = this.route.snapshot?.params['id'];
    this.getRequests();
  }

  setActiveTab(tab: string): void {
    this.selectedTab = tab;
    if (this.selectedTab == 'appointment') {
      this.resetsearch();
    }
  }

  getRequests() {
    let endpoint = '';
    this.requestLoader = true;
    this.requestload = true;
    this.requestloadmore = false;
    this.requestno++;
    if (this.requestSearch) {
      endpoint = 'request?skip=' + this.requestno + '&limit=' + this.requestsize + '&patient_id=' + this.patientId + '&search=' + this.requestSearch
    }
    else {
      endpoint = 'request?skip=' + this.requestno + '&limit=' + this.requestsize + '&patient_id=' + this.patientId
    }
    return new Promise((resolve) => {
      this.auth.get(endpoint).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.requestLoader = false;
            if (this.requestno == 1) {
              this.request_arr = res.data?.data;
              this.requestloaded = res.data?.data?.length;
            }
            else {
              for (let i = 0; i < res.data?.data?.length; i++) {
                this.request_arr.push(res.data?.data[i]);
                this.requestloaded++;
              }
            }
            this.requesttotal = parseInt(res.data?.total);
            this.requestload = false;
            this.requestloadmore = true;
            if (this.requestloaded >= this.requesttotal) {
              this.requestloadmore = false;
              this.requestload = false;
            }
          }
          resolve(true)
        },
        error: (err) => {
          this.requestLoader = false;
          this.requestloadmore = false;
          this.requestload = false;
          resolve(false);
        }
      })
    })
  }

  resetChatSearch() {
    this.requestno = 0;
    this.requestsize = 10;
    this.requesttotal = 0;
    this.requestloaded = 0;
    this.request_arr = []
    this.getRequests();
  }

  getChatbyId(id: any, user: any) {
    this.auth.get('chat/' + id).subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.showChat = true;
          this.user_details = user;
          this.chat_details = res.data?.data;
        }
      },
      error: (err) => {
        this.shared.showAlert('error', 'Error', err.error.message);
      }
    })
  }

  getAppointments() {
    let endpoint = '';
    this.appointmentsLoader = true;
    this.load = true;
    this.loadmore = false;
    this.no++;
    if (this.search) {
      endpoint = 'appointment?patient_id=' + this.patientId + '&page_no=' + this.no + '&limit=' + this.size + '&search=' + this.search
    }
    else {
      endpoint = 'appointment?patient_id=' + this.patientId + '&page_no=' + this.no + '&limit=' + this.size
    }
    return new Promise((resolve) => {
      this.auth.get(endpoint).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.appointmentsLoader = false;
            if (this.no == 1) {
              this.appointment_arr = res.data?.data;
              this.loaded = res.data?.data.length;
            }
            else {
              for (let i = 0; i < res.data?.data.length; i++) {
                this.appointment_arr.push(res.data?.data[i]);
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
          this.appointmentsLoader = false;
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
    this.appointment_arr = []
    this.getAppointments();
  }

  getServiceName(item: any): string {
    if (this.predefinedServices[item.service_name]) {
      return this.predefinedServices[item.service_name][this.selectedLang] || item.service_name;
    }
    return item?.service_name;
  }
}
