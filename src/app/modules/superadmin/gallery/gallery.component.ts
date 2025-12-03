import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GeneralServiceService } from '../../../services/general-service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent implements OnInit {
  getLoader = false;
  skeleton_arr = new Array(6);

  submitted = false;

  gallery_arr: any = [];
  files: any = [];
  image: any;

  @ViewChild('closeUpload') closeUpload!: ElementRef;

  constructor(private fb: FormBuilder, public auth: AuthService, private shared: GeneralServiceService, private translate: TranslateService) { }

  ngOnInit(): void {
    this.getGallery();
  }

  getGallery() {
    this.getLoader = true;
    this.auth.get('avatar').subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.getLoader = false;
          this.gallery_arr = res.data;
        }
      },
      error: (err) => {
        this.getLoader = false;
      }
    })
  }

  uploadAvatar(event: any) {
    this.submitted = true;
    this.files = event.target.files;
    if (this.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.image = e.target?.result;
      };
      reader.readAsDataURL(this.files[0]);
    }
    let formData = new FormData()
    formData.append('file', this.files[0]);

    this.auth.post('avatar', formData).subscribe({
      next: (res: any) => {
        if (res.status == 201) {
          this.closeUpload.nativeElement.click();
          this.shared.showAlert('success', 'Successful', res.message);
          this.submitted = false;
          this.getGallery();
        }
      },
      error: (err) => {
        this.shared.showAlert('error', 'Error', err.error.message);
        this.submitted = false;
      }
    })
  }

  deleteAvatar(id: any) {
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
        this.auth.delete('avatar/' + id, '').subscribe({
          next: (res: any) => {
            if (res.status == 200) {
              this.shared.showAlert('success', 'Successful', res.message);
              this.getGallery();
            }
          },
          error: (err) => {
            if (err.error.status === 404) {
              const translatedErrorMsg = this.translate.instant('responses.avatar_does_not_exist');
              this.shared.showAlert('error', 'Error', translatedErrorMsg);
            } else {
              this.shared.showAlert('error', 'Error', err.error.message);
            }
          }
        })
      }
    });

  }
}
