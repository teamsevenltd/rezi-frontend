import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { GeneralServiceService } from '../../../services/general-service.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.scss'
})
export class SubscriptionComponent implements OnInit {
  getLoader = false;
  skeleton_arr = new Array(4);

  submit_loading = false;
  cancel_loading = false;
  plans_arr: any = [];

  constructor(private auth: AuthService, private shared: GeneralServiceService, private translate: TranslateService) { }

  ngOnInit(): void {
    this.getSubscriptionPlans();
  }

  getSubscriptionPlans() {
    this.getLoader = true;
    this.auth.get('subscriptionplan').subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.getLoader = false;
          this.plans_arr = res.data;
        }
      },
      error: (err) => {
        this.getLoader = false;
      }
    })
  }

  submitPlan(index: number) {
    let stripe;
    this.plans_arr[index].submit_loading = true;
    let priceId = this.plans_arr[index]?.stripe_prices?.stripe_price_id;
    this.auth.post('subscriptionPlan/checkout', { price_id: priceId }).subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.plans_arr[index].submit_loading = false;
          location.href = res.data;
        }
        this.getSubscriptionPlans();
      },
      error: (err) => {
        this.plans_arr[index].submit_loading = false;
        this.shared.showAlert('error', 'Error', err.error.message);
      }
    });
  }

  cancelPlan(transactionId: any) {
    this.cancel_loading = true;
    this.auth.post('subscriptionPlan/cancel', { id: transactionId }).subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.cancel_loading = false;
          const translatedMsg = this.translate.instant('responses.plan_cancelled_successfully');
          this.shared.showAlert('success', 'Successful', translatedMsg);
        }
        this.getSubscriptionPlans();
      },
      error: (err) => {
        this.cancel_loading = false;
      }
    })
  }
}
