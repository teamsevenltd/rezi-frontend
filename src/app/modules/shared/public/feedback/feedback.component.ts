import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../auth/auth.service';
import { GeneralServiceService } from '../../../../services/general-service.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.scss'
})
export class FeedbackComponent implements OnInit {
  feedbackForm!: FormGroup;

  submitted = false;
  selectedRating = 0;
  stars = new Array(5);
  id: any;

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private auth: AuthService, private shared: GeneralServiceService) { }

  ngOnInit(): void {
    this.id = this.route?.snapshot?.params['id'];
    this.feedbackForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone_number: ['', Validators.required],
      facility_id: [this.id],
      feedback: ['', Validators.required],
      rating: ['', Validators.required]
    })
  }

  selectStar(index: number): void {
    this.selectedRating = index + 1;
    this.feedbackForm.patchValue({ rating: this.selectedRating })
  }

  addFeedback() {
    this.submitted = true;
    this.auth.post('feedback', this.feedbackForm.value).subscribe({
      next: (res: any) => {
        if (res.status == 201) {
          this.feedbackForm.reset();
          this.selectedRating = 0;
          this.shared.showAlert('success', 'Successful', res.message);
          this.submitted = false;
        }
      },
      error: (err) => {
        this.submitted = false;
        this.shared.showAlert('error', 'Error', err.error.message);
      }
    })
  }
}
