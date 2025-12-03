import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-app-sidebar',
  standalone: true,
  imports: [RouterLink, CommonModule, RouterLinkActive, TranslateModule],
  templateUrl: './app-sidebar.component.html',
  styleUrl: './app-sidebar.component.scss'
})
export class AppSidebarComponent implements OnInit {
  role: any;
  appointment = false;
  patient = false;

  constructor(public auth: AuthService, private route: Router) { }

  ngOnInit(): void {
    this.role = this.auth.userRole();
    let feature_list = [];
    let userData = JSON.parse(localStorage.getItem('userdata') || '{}');
    if (Object.keys(userData).length > 0) {
      feature_list = userData?.subscription?.subscription_plan_details?.feature_list_details;
      for (let i = 0; i < feature_list?.length; i++) {
        if (feature_list[i]?.feature_key == 'appointment') {
          this.appointment = true;
        }
        else if (feature_list[i]?.feature_key == 'patient') {
          this.patient = true;
        }
      }
    }
  }

  logout() {
    localStorage.clear();
    this.auth.setLoginStatus(false)
    this.route.navigate(['/'])
  }

}
