import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';
import { AuthService } from './auth/auth.service';
import { TranslateModule, TranslateService } from "@ngx-translate/core";
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(
    private router: Router,
    private title: Title,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService
  ) {
    this.translate.addLangs(['en', 'de']);
    this.translate.setDefaultLang('de');
    const browserLang = this.translate.getBrowserLang();
    this.translate.use(browserLang?.match(/en|de/) ? browserLang : 'de');
  }

  ngOnInit(): void {
    let lang = JSON.parse(localStorage.getItem('system_lang') || '{}');
    this.translate.addLangs(['de', 'en']);
    this.translate.setDefaultLang('de');
    if (Object.keys(lang).length > 0) {
      this.translate.use(lang);
    } else {
      this.translate.use('de');
    }
    this.setPageTitle();
  }
  // private setPageTitle(): void {
  //   const defaultPageTitle = 'Rezi24';
  //   this.router.events
  //     .pipe(
  //       filter((event) => event instanceof NavigationEnd),
  //       map(() => {
  //         let child = this.activatedRoute.firstChild;
  //         if (!child) {
  //           return (
  //             this.activatedRoute.snapshot.data['title'] || defaultPageTitle
  //           );
  //         }
  //         while (child.firstChild) {
  //           child = child.firstChild;
  //         }
  //         if (child.snapshot.data['title']) {
  //           return child.snapshot.data['title'] || defaultPageTitle;
  //         }
  //       })
  //     )
  //     .subscribe((title: string) =>
  //       this.title.setTitle(title + ' | Rezi24')
  //     );

  //   this.router.events.subscribe((value) => {
  //     if (value instanceof NavigationEnd) {
  //       if (this.auth.isLogin()) {
  //         this.auth.validateToken().then(value => {
  //           if (!value) {
  //             this.router.navigate(['/']);
  //           }
  //         })
  //       }
  //     }
  //   });
  // }

  private setPageTitle(): void {
    const defaultPageTitle = 'Rezi24';

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let child = this.activatedRoute.firstChild;
          if (!child) {
            return this.activatedRoute.snapshot.data['title'] || defaultPageTitle;
          }
          while (child.firstChild) {
            child = child.firstChild;
          }
          return child.snapshot.data['title'] || defaultPageTitle;
        }),
        switchMap((titleKey: string) => {
          return this.translate.get(titleKey);
        })
      )
      .subscribe((translatedTitle: string) => {
        this.title.setTitle(translatedTitle + ' | Rezi24');
      });

    this.router.events.subscribe((value) => {
      if (value instanceof NavigationEnd) {
        if (this.auth.isLogin()) {
          this.auth.validateToken().then(value => {
            if (!value) {
              this.router.navigate(['/']);
            }
          });
        }
      }
    });
  }

}
