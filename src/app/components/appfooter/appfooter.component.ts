import { Component } from '@angular/core';

@Component({
  selector: 'app-appfooter',
  standalone: true,
  imports: [],
  templateUrl: './appfooter.component.html',
  styleUrl: './appfooter.component.scss'
})
export class AppfooterComponent {
  currentYear:any;

  constructor() {
    const currentDate = new Date();
    this.currentYear = currentDate.getFullYear();
  }

}
