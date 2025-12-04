import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class GeneralServiceService {
  response: any;

  private addStepSubject = new Subject<void>();
  addStep$ = this.addStepSubject.asObservable();

  private facilityDetailsSubject = new Subject<void>();
  facilityDetails$ = this.facilityDetailsSubject.asObservable();

  locationId!: string;
  private locationSubject = new BehaviorSubject<any>(this.locationId);

  location$ = this.locationSubject.asObservable();

  private tabsRouteSubject = new Subject<any>();
  tabsRoute$ = this.tabsRouteSubject.asObservable();

  private languageSubject = new Subject<any>();
  language$ = this.languageSubject.asObservable();

  private userLanguageSubject = new Subject<any>();
  userLanguage$ = this.userLanguageSubject.asObservable();

  private stepChangeSource = new BehaviorSubject<{ previous: string; next: string; isExternalLink?: boolean } | null>(null);
  stepChange$ = this.stepChangeSource.asObservable();

  chosenLocation: string = '';

  constructor() {
    const temp = JSON.parse(localStorage.getItem('location') || '{}');
    if (Object.keys(temp).length > 0) {
      this.updateLocation(temp)
    }
  }

  showAlert(type: any, title: any, message: any) {
    Swal.fire({
      icon: type,
      title: title,
      html: message,
      position: 'top',
      toast: true,
      showConfirmButton: false,
      timer: 3000
    });
  }

  triggerAddStep() {
    this.addStepSubject.next();
  }

  deleteStep() {
  }

  getDetails(data: any) {
    this.facilityDetailsSubject.next(data);
  }

  updateStep(data: { previous: string; next: string; isExternalLink?: boolean }) {
    this.stepChangeSource.next(data);
  }

  getTab(name: any) {
    this.tabsRouteSubject.next(name);
  }

  updateLocation(location: any): void {
    localStorage.setItem('location', JSON.stringify(location));
    this.locationSubject.next(location);
  }
  getLocation(): string {
    return this.locationSubject.value;
  }
  unSubscribeLocation() {
    this.locationSubject.next(null);
  }

  setLanguage(lang: string) {
    this.languageSubject.next(lang);
  }
  setUserLanguage(lang: string) {
    this.userLanguageSubject.next(lang);
  }

  formatDate(dateString: string) {
    if (!dateString) {
      return '';
    }
    const date = new Date(dateString);
    const formattedDate = date.toISOString().split('T')[0];
    return formattedDate;
  }

  getTimefromDate(dateString: string) {
    let date = new Date(dateString).toISOString();
    let timePart = date.split('T')[1];
    let [hours, minutes] = timePart.split(':');

    let formattedTime = `${hours}:${minutes}`;
    return formattedTime;
  }

}
