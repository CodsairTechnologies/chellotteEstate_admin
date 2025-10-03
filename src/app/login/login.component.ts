import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  value2: string | undefined;
  username: string = '';
  password: string = '';
  token: any;
  type: any;
  loginId: any;
  userName: any;
  EmailId: any;
  status: any;
  loginbrowser: any;
  Loader: boolean | undefined;
  showPassword: boolean = false;


  loginForm!: FormGroup;
  errorMessage: string = '';
  display: boolean = false;

  // Modal control
  showForgotModal: boolean = false;
  modalStep: number = 1;

  // Forgot Password fields
  forgotEmail: string = '';
  otp: string = '';
  key: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  // Open Modal
  openForgotModal() {
    this.showForgotModal = true;
    this.modalStep = 1;
    this.forgotEmail = '';
    this.otp = '';
    this.key = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  // Close Modal
  closeModal() {
    this.showForgotModal = false;
  }



  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      Username: ['', Validators.required],
      Password: ['', Validators.required],
      rememberMe: [false] // Remember me checkbox
    })

    this.checkRememberMe();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  focusPassword() {
    // Focus the password input field when Enter is pressed
    const passwordField = document.getElementById('password') as HTMLElement;
    if (passwordField) {
      passwordField.focus();
    }
  }
  /**
   * super admin login
   */


  Login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const username = this.loginForm.get('Username')?.value;
    const password = this.loginForm.get('Password')?.value;
    const remember = this.loginForm.get('rememberMe')?.value;

    if (remember) {
      localStorage.setItem('savedUsername', username);
      localStorage.setItem('savedPassword', password);
      localStorage.setItem('savedTime', Date.now().toString());
    } else {
      localStorage.removeItem('savedUsername');
      localStorage.removeItem('savedPassword');
      localStorage.removeItem('savedTime');
    }

    const payload = {
      username: username,
      password: password,
      loginbrowser: this.getBrowserName()
    };

    // Show loader before API call
    this.Loader = true;

    this.handleApiCall('api/admin/login/', payload, (response) => {
      // Hide loader after API call completes
      this.Loader = false;

      if (response.response === 'Success') {
        this.saveLoginDetails(response.logindetails);
        this.showSuccess('Login Successful!');
        this.router.navigateByUrl('super-admin/banner');

        // this.router.navigate(['/super-admin/banner']);
      } else {
        this.showError(response.message || 'Invalid username or password');
      }
    });
  }

  /** Load Remember Me data if valid */
  checkRememberMe() {
    const savedUsername = localStorage.getItem('savedUsername');
    const savedPassword = localStorage.getItem('savedPassword');
    const savedTime = localStorage.getItem('savedTime');

    if (savedUsername && savedPassword && savedTime) {
      const currentTime = Date.now();
      const storedTime = parseInt(savedTime, 10);
      const diff = currentTime - storedTime;

      // Only load if less than 3 days old
      if (diff <= 3 * 24 * 60 * 60 * 1000) {
        this.loginForm.patchValue({
          Username: savedUsername,
          Password: savedPassword,
          rememberMe: true
        });
      } else {
        // Expired saved login
        localStorage.removeItem('savedUsername');
        localStorage.removeItem('savedPassword');
        localStorage.removeItem('savedTime');
      }
    }
  }

  //  Forgot Password
  submitForgotPassword() {
    if (!this.forgotEmail) {
      this.showError('Email is required');
      return;
    }

    const payload = { emailId: this.forgotEmail };

    this.handleApiCall('api/admin/forgotpassword/', payload, (response) => {
      if (response.key) {
        this.key = response.key;
        this.modalStep = 2;
        this.showSuccess('OTP sent to your email');
      } else {
        this.showError(response.message || 'Unable to send OTP');
      }
    });
  }


  // Verify OTP
  submitOtpVerification() {
    if (!this.otp) {
      this.showError('OTP is required');
      return;
    }

    const payload = {
      emailId: this.forgotEmail,
      otp: this.otp,
      key: this.key
    };

    this.handleApiCall('api/admin/verifyotp/', payload, (response) => {
      if (response.response === 'Success') {
        this.modalStep = 3;
        this.showSuccess(response.message || 'OTP Verified');
      } else {
        this.showError(response.message || 'Invalid OTP');
      }
    });
  }



  //  Change Password
  submitNewPassword() {
    if (!this.newPassword || !this.confirmPassword) {
      this.showError('Please fill all fields');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.showError('Passwords do not match');
      return;
    }

    const payload = {
      emailId: this.forgotEmail,
      newpwd: this.newPassword,
      confirmpwd: this.confirmPassword
    };

    this.handleApiCall('api/admin/changepassword/', payload, (response) => {
      if (response.response === 'Success') {
        this.showSuccess(response.message || 'Password changed successfully');
        this.closeModal();
      } else {
        this.showError(response.message || 'Password change failed');
      }
    });
  }




  // Detect browser name
  getBrowserName(): string {
    const { userAgent, vendor } = navigator;
    if (/Edg/.test(userAgent)) return 'Microsoft Edge';
    if (/Chrome/.test(userAgent) && /Google Inc/.test(vendor)) return 'Chrome';
    if (/Safari/.test(userAgent) && /Apple Computer/.test(vendor)) return 'Safari';
    if (/Firefox/.test(userAgent)) return 'Firefox';
    if (/MSIE|Trident/.test(userAgent)) return 'Internet Explorer';
    return 'Other';
  }

  // Save login details to localStorage
  saveLoginDetails(details: any): void {
    const keys = [
      'token', 'type', 'loginId', 'EmailId', 'username', 'status',
    ];
    keys.forEach((key) => localStorage.setItem(key, details[key]));
  }

  // Generic API handler
  handleApiCall(endpoint: string, payload: any, onSuccess: (res: any) => void): void {
    this.http.post(environment.apiUrl + endpoint, payload).subscribe({
      next: onSuccess,
      error: (error) => {
        if (error.status === 401) {
          this.logout();
        } else {
          this.showError('An unknown error occurred during the API call.');
        }
      }
    });
  }


  // Logout function to be called on 401 error

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('type');
    localStorage.removeItem('loginId');
    localStorage.removeItem('EmailId');
    localStorage.removeItem('username');
    localStorage.removeItem('status');
    localStorage.removeItem('loginbrowser');

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

}
