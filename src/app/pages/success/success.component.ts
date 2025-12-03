import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './success.component.html',
  styleUrl: './success.component.scss'
})
export class SuccessComponent implements OnInit {
  loading = false;
  session_id: any;
  transaction_id: any;

  details: any;

  constructor(private auth: AuthService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.session_id = this.route?.snapshot?.queryParams['session_id'];
    this.transaction_id = this.route?.snapshot?.queryParams['transaction_id'];
    this.getDetails();
  }

  getDetails() {
    this.loading = true;
    this.auth.get('subscriptionPlan/fulfill?session_id=' + this.session_id + '&transaction_id=' + this.transaction_id).subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.loading = false;
          this.details = res.data;
        }
      },
      error: (err) => {
        this.loading = false;
      }
    })
  }

  confirm() {
    // let role_key = JSON.parse(localStorage.getItem('userdata') || '{}')?.role_id?.key
    // this.router.navigate([`/${role_key}/subscription`]);
    this.router.navigate(['/medicalprovider/subscription']);
  }
}
