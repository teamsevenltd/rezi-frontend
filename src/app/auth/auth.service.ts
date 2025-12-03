import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { GeneralServiceService } from '../services/general-service.service';

const API_URL = environment.apiUrl;
interface auth {
  status: any;
  data: any;
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginStatus = false;
  private role = '';
  private authtime = 0;
  userData: any;

  constructor(private http: HttpClient, private router: Router, private shared: GeneralServiceService) { }

  getapi() {
    return API_URL
  }

  getToken() {
    if (localStorage?.getItem('authtoken') != null) {
      return JSON.parse(localStorage.getItem('authtoken') || '{}');
    } else {
      return null
    }
  }

  post(ep: any, q: any) {
    var token = this.getToken()
    if (token) {
      return this.http.post<auth>(API_URL + ep, q, {
        headers:
        {
          'Authorization': 'Bearer ' + token
        }
      });
    } else {
      return this.http.post<auth>(API_URL + ep, q);
    }
  }

  get(q: any) {
    var token = this.getToken()
    if (token) {
      return this.http.get<auth>(API_URL + q, { headers: { 'Authorization': 'Bearer ' + token } });
    } else {
      return this.http.get<auth>(API_URL + q);
    }
  }

  patch(ep: any, q: any) {
    var token = this.getToken();
    if (token) {
      return this.http.patch<auth>(API_URL + ep, q, {
        headers:
        {
          'Authorization': 'Bearer ' + token
        }
      });
    } else {
      return this.http.patch<auth>(API_URL + ep, q);
    }
  }

  delete(ep: any, q: any) {
    var token = this.getToken()
    if (token) {
      const options = {
        headers: new HttpHeaders({
          'Authorization': 'Bearer ' + token
        }),
        body: q,
      };
      return this.http.delete<auth>(API_URL + ep, options)
    } else {
      const options = {
        headers: {},
        body: q,
      };
      return this.http.delete<auth>(API_URL + ep, options)
    }
  }

  validateToken() {
    const validate = new Promise((resolve) => {
      if (this.getToken()) {
        var token = this.getToken();
        lastValueFrom(this.http.get(API_URL + 'validate', {
          headers: {
            Authorization: 'Bearer ' + token,
          }
        })).then(
          (res: any) => {
            if (res.status === 200) {
              if (res?.token == null) {
                this.setLoginStatus(false);
                localStorage.clear();
                resolve(false);
              }
              localStorage.setItem('authtoken', JSON.stringify(res.token));
              localStorage.setItem('userdata', JSON.stringify(res.data));
              this.setLoginStatus(true);
              var user = localStorage.getItem('userdata') ? localStorage.getItem('userdata') : '';
              var role = user ? JSON.parse(user).role_id?.key : '';
              this.setuserRole(role);
            }
            resolve(true);
          },
          (err: any) => {
            this.setLoginStatus(false);
            localStorage.clear();
            this.router.navigate(['/login']);
            resolve(false);
          }
        );
      }
      else {
        if (this.isLogin() == true) {
          this.setLoginStatus(false);
          localStorage.clear();
        }
        resolve(false);
      }
    })
    return validate;
  }

  // validateToken() {
  //   const promise = new Promise((resolve) => {
  //     if (this.getToken()) {
  //       var token = this.getToken()
  //       lastValueFrom(this.http.get<auth>(API_URL + 'validate', { headers: { 'Authorization': 'Bearer ' + token } }))
  //         .then((res: any) => {
  //           if (res.status == 200) {
  //             localStorage.setItem('compassaccesstoken', res.token);
  //             localStorage.setItem('userdata', JSON.stringify(res.data));
  //             this.setLoginStatus(true)
  //             this.setValidTime()
  //             var user = localStorage.getItem('userdata') ? localStorage.getItem('userdata') : '';
  //             var role = user ? JSON.parse(user).role_key : '';
  //             this.setuserRole(role);
  //             resolve(true)
  //           }
  //         }, err => { })
  //     } else {
  //       this.setLoginStatus(false)
  //       localStorage.clear()
  //       resolve(false)
  //     }
  //   })
  //   return promise
  // }

  // checkToken() {
  //   const promise = new Promise((resolve) => {
  //     if (this.getToken()) {
  //       var token = this.getToken()
  //       lastValueFrom(this.http.get<auth>(API_URL + 'validate', { headers: { 'Authorization': '' + token } }))
  //         .then((res: any) => {
  //           if (res.status == 200) {
  //             if (res.auth_token == null) {
  //               this.setLoginStatus(false)
  //               localStorage.clear()
  //               resolve(false)
  //             }
  //             localStorage.setItem('compassaccesstoken', res.auth_token);
  //             localStorage.setItem('userdata', JSON.stringify(res.data));
  //             this.setLoginStatus(true)
  //             this.setValidTime()
  //             var user = localStorage.getItem('userdata') ? localStorage.getItem('userdata') : '';
  //             var role = user ? JSON.parse(user).role_key : '';
  //             this.setuserRole(role)
  //             resolve(true)
  //           }
  //         }, error => {
  //           if (error.status == 404) {
  //             this.router.navigate(['/login'])
  //           }
  //         })
  //     } else {
  //       this.setLoginStatus(false)
  //       localStorage.clear()
  //       resolve(false)
  //     }
  //   })
  //   return promise
  // }

  setLoginStatus(v: boolean) {
    this.loginStatus = v;
  }

  isLogin() {
    return this.loginStatus;
  }

  setuserRole(r: string) {
    this.role = r;
  }

  userRole() {
    return this.role;
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.shared.unSubscribeLocation();
    this.setLoginStatus(false);
  }
  // setValidTime() {
  //   this.authtime = Math.floor(Date.now() / 1000) + 100000
  // }

  // getValidTIme() {
  //   return this.authtime <= Math.floor(Date.now() / 1000)
  // }
}
