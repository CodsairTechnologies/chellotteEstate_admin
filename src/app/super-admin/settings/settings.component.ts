import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { ApiIntegrationService } from '../../../api-service/api-integration.service';
import { ViewChild, ElementRef } from '@angular/core';
import { DialogModule } from 'primeng/dialog';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, DialogModule,
    HttpClientModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  @ViewChild('closePasswordModalBtn') closePasswordModalBtn!: ElementRef;

  userName: string = '';
  userEmail: string = '';
  showPasswordModal: boolean = false;

  changePasswordForm!: FormGroup;

  profileForm!: FormGroup;
  isEditing: boolean = false; // default: not editing

  userId: string = ''; // Assuming this is stored in localStorage too
  Loader: boolean = false;

  changePasswordDialogVisible: boolean = false;


  constructor(private fb: FormBuilder, private http: HttpClient, private objApiService: ApiIntegrationService) { }

  ngOnInit(): void {
    // Fetch user details from localStorage
    this.userId = localStorage.getItem('loginId') || '';
    this.userName = localStorage.getItem('username') || '';
    this.userEmail = localStorage.getItem('EmailId') || '';

    // Log values to verify they're correctly fetched
    console.log('User ID:', this.userId);
    console.log('Username:', this.userName);
    console.log('Email ID:', this.userEmail);

    // Initialize profile form
    this.profileForm = this.fb.group({
      username: [{ value: this.userName, disabled: true }, [Validators.required, Validators.minLength(3)]],
      emailId: [{ value: this.userEmail, disabled: true }, [Validators.required, Validators.email]]
    });


    // Initialize change password form
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }


  toggleEdit() {
    this.isEditing = !this.isEditing;

    if (this.isEditing) {
      this.profileForm.enable();
    } else {
      this.profileForm.disable();
    }
  }




  openPasswordModal() {
    this.showPasswordModal = true;
    this.changePasswordForm.reset();
  }

  closePasswordModal() {
    this.showPasswordModal = false;
  }

submitPasswordChange() {
  console.log('fn called');

  if (this.changePasswordForm.invalid) {
    this.changePasswordForm.markAllAsTouched();
    return; // stop execution if invalid
  }

  console.log('fn called inside');

  const { oldPassword, newPassword, confirmPassword } = this.changePasswordForm.value;

  console.log(oldPassword, newPassword, confirmPassword);

  if (newPassword !== confirmPassword) {
    this.showError('Passwords do not match');
    return;
  }

  const payload = {
    email: this.userEmail,
    old_password: oldPassword,
    new_password: newPassword,
    confirm_password: confirmPassword
  };

  this.Loader = true;

  this.objApiService.handleApiCall('api/admin/profilechangepassword/', payload, (response) => {
    this.Loader = false;

    if (response.response === 'Success') {
      this.showSuccess(response.message || 'Password changed successfully');

      // Close PrimeNG dialog
      this.changePasswordDialogVisible = false;

      this.changePasswordForm.reset();
    } else {
      this.showError(response.message || 'Password change failed');
    }
  });
}


  submitProfileUpdate() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const payload = {
      id: this.userId,
      username: this.profileForm.value.username,
      emailId: this.profileForm.value.emailId
    };
this.Loader = true;
    this.objApiService.handleApiCall('api/admin/updateadmin/', payload, (response) => {
      this.Loader = false;
      if (response.response?.toLowerCase() === 'success') {
        const updatedUser = response.data;

        localStorage.setItem('loginId', updatedUser.id);
        localStorage.setItem('username', updatedUser.username);
        localStorage.setItem('EmailId', updatedUser.emailId);

        this.userId = updatedUser.id;
        this.userName = updatedUser.username;
        this.userEmail = updatedUser.emailId;

        this.profileForm.patchValue({
          username: updatedUser.username,
          emailId: updatedUser.emailId
        });

        this.showSuccess(response.message || 'Profile updated successfully');
        this.toggleEdit();

        // Reload page after a short delay
        setTimeout(() => {
          this.reloadCurrentPage();
        }, 1000);
      } else {
        this.showError(response.message || 'Update failed');
      }
    });
  }

  reloadCurrentPage() {
    window.location.reload();
  }


  logout(): void {
    localStorage.clear();
    window.location.href = '/login';
  }

  showSuccess(message: string) {
    Swal.fire({
      icon: 'success',
      title: message,
      toast: true,
      position: 'top-end',
      timer: 3000,
      showConfirmButton: false
    });
  }

  showError(message: string) {
    Swal.fire({
      icon: 'error',
      title: message,
      toast: true,
      position: 'top-end',
      timer: 3000,
      showConfirmButton: false
    });
  }
}
