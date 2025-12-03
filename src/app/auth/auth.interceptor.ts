import { HttpEvent, HttpEventType, HttpHandlerFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const router = inject(Router);
  const auth = inject(AuthService);

  return next(req).pipe(
    tap(event => {
      if (event.type === HttpEventType.Response) {
        return
      }
    }),
    catchError((error: HttpErrorResponse) => {
      let errorMsg = '';
      let errorStatus = '';

      if (error.error instanceof ErrorEvent) {
        errorStatus = `Error Code: ${error.status}`;
        errorMsg = `Message: ${error.error.message}`;
      }
      else {
        if (error.error.status == 500) {
          errorStatus = `Error Code: 500`;
          errorMsg = `Message: Internal Server Error`;
          Swal.fire({
            icon: 'error',
            title: errorStatus,
            text: errorMsg,
            position: 'top',
            toast: true,
            showConfirmButton: false,
            timer: 2500
          });
        }
        else if (error.error.status == 0) {
          errorStatus = `Error sending request`;
          errorMsg = `You are sending an invalid request.`;
          Swal.fire({
            icon: 'error',
            title: errorStatus,
            text: errorMsg,
            position: 'top',
            toast: true,
            showConfirmButton: false,
            timer: 2500
          });
        }
        else if (error.error.status == 401) {
          errorStatus = `Error Code: 401`;
          errorMsg = `${error.error?.message || 'Unauthorized access'}`;
          localStorage.clear();
          auth.setLoginStatus(false);
          router.navigate(['/']);
          Swal.fire({
            icon: 'error',
            title: errorStatus,
            text: errorMsg,
            position: 'top',
            toast: true,
            showConfirmButton: false,
            timer: 2500
          });
        }
      }

      return throwError(() => error);
    })
  );
}
