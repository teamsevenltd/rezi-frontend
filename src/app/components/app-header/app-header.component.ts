import { CommonModule } from '@angular/common';
import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { GeneralServiceService } from '../../services/general-service.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-app-header',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss'
})
export class AppHeaderComponent implements OnInit, AfterViewChecked {
  firstname: any;
  name: any;
  picture: any;
  role: any;

  role_key: any;

  getLoader = false;
  skeleton_arr = new Array(6);

  currentLang: string = '';
  flagSrc: string = '';

  location_id: any;
  location_obj: any;
  location_arr: any = [];

  @ViewChild('closeModal') closeModal!: ElementRef;

  constructor(private router: Router, public auth: AuthService, private cdRef: ChangeDetectorRef, private shared: GeneralServiceService, private translate: TranslateService) { }

  ngOnInit(): void {
    let data = JSON.parse(localStorage.getItem('userdata') || '{}')
    if (Object.keys(data).length > 0) {
      this.role_key = data?.role_id?.key;
    }
    if (this.role_key != 'superadmin') {
      this.shared.location$.subscribe((location) => {
        this.location_id = location?._id;
        this.getLocations()
      });
    }
    let lang = JSON.parse(localStorage.getItem('system_lang') || '{}');
    if (Object.keys(lang).length > 0) {
      this.currentLang = lang;
      if (this.currentLang == 'en') {
        this.flagSrc = './assets/images/flags/us.svg'
      } else {
        this.flagSrc = './assets/images/flags/germany.svg';
      }
    } else {
      this.currentLang = 'de';
      this.flagSrc = './assets/images/flags/germany.svg';
    }
  }

  ngAfterViewChecked() {
    let userforheader = localStorage.getItem('userdata') ? localStorage.getItem('userdata') : '';
    this.firstname = userforheader ? JSON.parse(userforheader)?.first_name : '';
    this.name = userforheader ? JSON.parse(userforheader)?.first_name + ' ' + JSON.parse(userforheader)?.last_name : '';
    this.role = userforheader ? JSON.parse(userforheader)?.role_id?.name : '';
    this.picture = userforheader ? (JSON.parse(userforheader)?.picture ? this.auth.getapi() + JSON.parse(userforheader)?.picture : './assets/images/users/avatar-3.jpg') : '';
    this.cdRef.detectChanges();
  }

  toggleSidebarSize() {
    try {
      var htmlElement = document.querySelector('html');
      var bodyElement = document.querySelector('body');
      if (htmlElement) {
        if (bodyElement) {
          if (window.innerWidth <= 767) {
            htmlElement.setAttribute('data-sidebar-size', 'lg');
            bodyElement.classList.add('vertical-sidebar-enable');
            //   bodyElement.classList.remove('vertical-sidebar-enable');
            const overlayElement = document.querySelector('.vertical-overlay') as HTMLElement;
            const overlayElementSide = document.querySelector('#scrollbar') as HTMLElement;
            overlayElement.addEventListener('click', () => {
              const bodyElement = document.body;
              bodyElement.classList.remove('vertical-sidebar-enable');
            });
            overlayElementSide.addEventListener('click', () => {
              const bodyElement = document.body;
              bodyElement.classList.remove('vertical-sidebar-enable');
            });
          }
          else {
            if (htmlElement.getAttribute('data-sidebar-size') === 'lg') {
              htmlElement.setAttribute('data-sidebar-size', 'sm');
            }
            else {
              htmlElement.setAttribute('data-sidebar-size', 'lg');
            }
          }
        }
      }
    }
    catch (error) {
      console.error('An error occurred:', error);
    }
  }

  switchLanguage(lang: string) {
    this.shared.setLanguage(lang);
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem('system_lang', JSON.stringify(lang));
    this.flagSrc = lang === 'de' ? './assets/images/flags/germany.svg' : './assets/images/flags/us.svg';
  }

  getLocations() {
    this.getLoader = true;
    this.auth.get('location?status=true').subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.getLoader = false;
          this.location_arr = res.data?.data;
          this.location_obj = this.location_arr.find((location: any) => location?._id === this.location_id);
        }
      },
      error: (err) => {
        this.getLoader = false;
        this.closeModal.nativeElement.click();
        this.location_arr = [];
      }
    })
  }

  selectHeaderLocation(obj: any) {
    this.shared.updateLocation(obj);
    this.location_id = obj?._id;
    this.getLocations();
    this.closeModal.nativeElement.click();
  }

  gotoSettings() {
    let user = localStorage.getItem('userdata') ? localStorage.getItem('userdata') : '';
    let role = user ? JSON.parse(user)?.role_id?.key : '';
    if (role) {
      this.router.navigate(['/' + role + '/settings'])
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

}
