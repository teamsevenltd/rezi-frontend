import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { GeneralServiceService } from '../../../../services/general-service.service';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [],
  templateUrl: './news.component.html',
  styleUrl: './news.component.scss'
})
export class NewsComponent implements OnInit {
  id: any;
  news_arr: any = [];

  constructor(private auth: AuthService, private route: ActivatedRoute, private shared: GeneralServiceService) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.getNews();
  }

  getNews() {
    this.auth.get('news/public/' + this.id).subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.news_arr = res.data;
        }
      },
      error: (err) => {
        this.shared.showAlert('error', 'Error', err.error.message);
      }
    })
  }
}
