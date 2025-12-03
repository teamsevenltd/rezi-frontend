import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularEditorConfig, AngularEditorModule } from '@kolkov/angular-editor';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../auth/auth.service';
import { GeneralServiceService } from '../../../services/general-service.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AngularEditorModule, TranslateModule],
  templateUrl: './news.component.html',
  styleUrl: './news.component.scss'
})
export class NewsComponent implements OnInit {
  addNewsForm!: FormGroup;
  editNewsForm!: FormGroup;

  submitted = false;
  loading = false;

  news_arr: any[] = [];
  search = '';
  no = 0;
  size = 50;
  loadmore: boolean = true;
  load: boolean = true;
  loaded: number = 0;
  total = 0;

  getLoader = false;
  skeleton_arr = new Array(6);

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    translate: 'no',
    sanitize: false,
    placeholder: 'Enter text here',
    defaultFontName: 'Times New Roman',
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'times-new-roman', name: 'Times New Roman' },
    ],
  };

  @ViewChild('closeAddModal') closeAddModal!: ElementRef;
  @ViewChild('closeEditModal') closeEditModal!: ElementRef;

  constructor(private fb: FormBuilder, private auth: AuthService, private shared: GeneralServiceService, private translate: TranslateService) { }

  ngOnInit(): void {
    this.addNewsForm = this.fb.group({
      title: ['', Validators.required],
      news: ['']
    });
    this.editNewsForm = this.fb.group({
      id: [''],
      visibility: [''],
      title: ['', Validators.required],
      news: ['']
    })
    this.getNews();
  }

  // news submission
  submitNews() {
    this.loading = true;
    this.submitted = true;
    if (this.addNewsForm.invalid) {
      this.loading = false;
    }
    else {
      this.auth.post('news', this.addNewsForm.value).subscribe({
        next: (res: any) => {
          if (res.status == 201) {
            this.loading = false;
            this.closeAddModal.nativeElement.click();
            this.addNewsForm.reset();
            const translatedMsg = this.translate.instant('responses.news_created_successfully');
            this.shared.showAlert('success', 'Successful', translatedMsg);
            this.submitted = false;
          }
          this.resetsearch();
        },
        error: (err) => {
          this.loading = false;
          this.submitted = false;
          this.shared.showAlert('error', 'Error', err.error.message);
        }
      })
    }
  }

  getNews() {
    let endpoint = '';
    this.getLoader = true;
    this.load = true;
    this.loadmore = false;
    this.no++;
    if (this.search) {
      endpoint = 'news?page=' + this.no + '&limit=' + this.size + '&search=' + this.search
    }
    else {
      endpoint = 'news?page=' + this.no + '&limit=' + this.size
    }
    return new Promise((resolve) => {
      this.auth.get(endpoint).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.getLoader = false;
            if (this.no == 1) {
              this.news_arr = res.data?.data;
              this.loaded = res.data?.data.length;
            }
            else {
              for (let i = 0; i < res.data?.data.length; i++) {
                this.news_arr.push(res.data?.data[i]);
                this.loaded++;
              }
            }
            this.total = parseInt(res.data?.total);
            this.load = false;
            this.loadmore = true;
            if (this.loaded >= this.total) {
              this.loadmore = false;
              this.load = false;
            }
          }
          resolve(true)
        },
        error: (err) => {
          this.getLoader = false;
          this.loadmore = false;
          this.load = false;
          resolve(false);
        }
      })
    })
  }

  resetsearch() {
    this.no = 0;
    this.size = 50;
    this.total = 0;
    this.loaded = 0;
    this.news_arr = []
    this.getNews();
  }

  editNews(index: number) {
    let news = this.news_arr[index];
    this.editNewsForm.patchValue({
      id: news?._id,
      visibility: news?.visibility || true,
      title: news?.title,
      news: news?.news,
    });
  }

  // news updation
  updateNews() {
    this.loading = true;
    this.submitted = true;
    if (this.editNewsForm.invalid) {
      this.loading = false;
    }
    else {
      this.auth.patch('news', this.editNewsForm.value).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            this.loading = false;
            this.closeEditModal.nativeElement.click();
            this.editNewsForm.reset();
            const translatedMsg = this.translate.instant('responses.news_updated_successfully');
            this.shared.showAlert('success', 'Successful', translatedMsg);
            this.submitted = false;
          }
          this.resetsearch();
        },
        error: (err) => {
          this.loading = false;
          this.submitted = false;
          this.shared.showAlert('error', 'Error', err.error.message);
        }
      })
    }
  }

  deleteNews(id: any) {
    Swal.fire({
      title: this.translate.instant('sweet_alert.are_you_sure'),
      text: this.translate.instant('sweet_alert.action_cannot_be_revert'),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000000",
      cancelButtonColor: "#d33",
      confirmButtonText: this.translate.instant('sweet_alert.delete'),
      cancelButtonText: this.translate.instant('sweet_alert.cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.auth.delete('news/' + id, '').subscribe({
          next: (res: any) => {
            if (res.status == 200) {
              this.loading = false;
              const translatedMsg = this.translate.instant('responses.news_deleted_successfully');
              this.shared.showAlert('success', 'Successful', translatedMsg);
            }
            this.resetsearch()
          },
          error: (err) => {
            this.loading = false;
            this.shared.showAlert('error', 'Error', err.error.message);
          }
        })
      }
    });
  }
}
