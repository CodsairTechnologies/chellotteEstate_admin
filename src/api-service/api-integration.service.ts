import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import Swal from 'sweetalert2';
@Injectable({
  providedIn: 'root'
})
export class ApiIntegrationService {
  Loader: boolean = false;

  token = localStorage.getItem("token");
  reqHeader = new HttpHeaders({
    'Authorization': 'Bearer ' + this.token
  });
  constructor(private http: HttpClient, private router: Router) {

  }



  handleApiCall(endpoint: string, payload: any, onSuccess: (res: any) => void) {
    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });
    this.http.post(environment.apiUrl + endpoint, payload, { headers: reqHeader }).subscribe({
      next: onSuccess,
      error: (error) => {
        this.Loader = false;
        if (error.status === 401) {
          this.logout();
        } else {
          // this.showError('Something went wrong. Please try again.');
          const errorMessage = error.error?.message || error.message || 'An unexpected error occurred.';
          this.showError(errorMessage);
        }
      },
      complete: () => (this.Loader = false),
    });
  }

  handleFileDownload(endpoint: string, payload: any, onSuccess: (res: ArrayBuffer) => void) {
    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.http.post(environment.apiUrl + endpoint, payload, {
      headers: reqHeader,
      responseType: 'arraybuffer'
    }).subscribe({
      next: onSuccess,
      error: (error) => {
        this.Loader = false;
        if (error.status === 401) {
          this.logout();
        } else {
          const errorMessage = error.error?.message || error.message || 'An unexpected error occurred.';
          this.showError(errorMessage);
        }
      },
      complete: () => (this.Loader = false),
    });
  }


  logout(): void {
    // List of keys to remove
    const keysToRemove = ['token', 'type', 'loginId', 'EmailId', 'username', 'status'];

    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Redirect to login page
    this.router.navigate(['/login']);
  }


  showSuccess(message: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
    Toast.fire({
      icon: 'success',
      title: message
    });
  }

  showError(message: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
    Toast.fire({
      icon: 'error',
      title: message
    });
  }

  showWarning(message: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
    Toast.fire({
      icon: 'warning',
      title: message
    });
  }
}
