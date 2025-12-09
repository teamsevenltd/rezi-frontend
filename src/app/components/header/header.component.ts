import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GeneralServiceService } from '../../services/general-service.service';
import { AuthService } from '../../auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  facility_details: any;
  breadcrumb_info: any;

  currentLang: string = '';
  flagSrc: string = '';

  constructor(private shared: GeneralServiceService, public auth: AuthService, private translate: TranslateService) {
    // this.shared.stepChange$.subscribe((info: any) => {
    //   if (info) {
    //     this.breadcrumb_info = this.translateBreadcrumb(info);
    //   }
    // });

    combineLatest([
      this.shared.stepChange$,
      this.translate.onLangChange
    ]).subscribe(([info, _]) => {
      if (info) {
        this.breadcrumb_info = this.translateBreadcrumb(info);
      }
    });

    let lang = localStorage.getItem('user_lang');
    if (lang) {
      this.currentLang = lang;
    } else {
      this.currentLang = 'de';
    }
    this.changeUserLanguage(this.currentLang);
  }

  ngOnInit(): void {
    this.shared.facilityDetails$.subscribe((details: any) => {
      if (details) {
        this.facility_details = details;
      }
    })
  }

  changeUserLanguage(lang: string) {
    this.shared.setUserLanguage(lang);
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem('user_lang', lang);
    this.flagSrc = lang === 'de' ? './assets/images/flags/germany.svg' : './assets/images/flags/us.svg';
  }

  translateBreadcrumb(info: any) {
    const map: any = {
      'Menu': 'app.menu',
      'Location': 'app.location',
      'Service': 'app.service',
      'Department': 'app.department',
      'Info': 'app.info',
      'Steps': 'app.steps'
    };

    return {
      previous: this.translate.instant(map[info.previous] || info.previous),
      next: this.translate.instant(map[info.next] || info.next)
    };
  }

  // scrolled = false;
  // isNavbarOpen = false;
  // closeNavbar() {
  //   this.isNavbarOpen = false;
  // }
  // toggleNavbar() {
  //   this.isNavbarOpen = !this.isNavbarOpen;
  // }
  // @HostListener('window:scroll', ['$event'])
  // onScroll(event: any) {
  //   if (window.scrollY > 100) {
  //     this.scrolled = true;
  //   } else {
  //     this.scrolled = false;
  //   }
  // }
}
