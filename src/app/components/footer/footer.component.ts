import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GeneralServiceService } from '../../services/general-service.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  facility_details: any;
  currentLang: string = '';

  constructor(private shared: GeneralServiceService, private translate: TranslateService) { }

  ngOnInit(): void {
    this.shared.facilityDetails$.subscribe((details) => {
      this.facility_details = details;
    });
    this.getTabName('menu')

    let lang = localStorage.getItem('user_lang');
    if (lang) {
      this.currentLang = lang;
    } else {
      this.currentLang = 'de';
    }
    this.translate.use(this.currentLang);
  }

  getTabName(name: string) {
    this.shared.getTab(name);
  }

  // backtotop() {
  //   document.body.scrollTop = 0;
  //   document.documentElement.scrollTop = 0;
  // }
}
