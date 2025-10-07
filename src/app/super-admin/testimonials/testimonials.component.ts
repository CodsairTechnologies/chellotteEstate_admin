import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import Swal from 'sweetalert2';
import { ApiIntegrationService } from '../../../api-service/api-integration.service';
import { environment } from '../../../environments/environment';
import { TableComponent } from '../../common-table/table/table.component';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, DialogModule, TableComponent],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.css'
})
export class TestimonialsComponent {
  token: any;
  adminid: any;
  Loader = false;

  openModal = false;
  deleteModal = false;
  displaySingleViewModal = false;
  modalHeader = 'Add Testimonial';

  arrList: any[] = [];
  arrColumns: any[] = [
    { strHeader: 'Sl. No.', strAlign: 'center', strKey: 'slNo', field: 'slNo' },
    { strHeader: 'Profile Image', strAlign: 'center', strKey: 'image', field: 'image' },
    { strHeader: 'Customer Name', strAlign: 'center', strKey: 'name', field: 'name' },
    { strHeader: 'Testimonial', strAlign: 'left', strKey: 'testimony', field: 'testimony' },
    { strHeader: "Status", strAlign: "center", strKey: "strStatus" },
    { strHeader: 'Actions', strAlign: 'center', strKey: 'strActions' }
  ];

  blnHasSingleview = true;
  blnForDelete = true;
  blnNoEdit = true;

  TestimonialForm!: FormGroup;
  showImageBox = false;
  imagePreview: string | ArrayBuffer | null = '';
  fileType = '';

  ID: any;
  selectedTestimonial: any = null;

  constructor(private fb: FormBuilder, private objApiService: ApiIntegrationService, @Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.token = localStorage.getItem('token');
      this.adminid = localStorage.getItem('loginId');
    }

    this.TestimonialForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      testimony: ['', [Validators.required, Validators.maxLength(200)]],
      profile_image: [null, this.imageRequiredValidator]
    });

    this.getTestimonials();
  }

  imageRequiredValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    return value instanceof File || value === 'preloaded' ? null : { required: true };
  }

  getTestimonials() {
    this.Loader = true;
    this.objApiService.handleApiCall('/api/admin/GetTestimonials/', {}, (res) => {
      this.Loader = false;

      if (res.response === 'Success' && res.data?.length) {
        this.arrList = res.data.map((item: any, i: number) => ({
          ...item,
          slNo: i + 1,
          image: item.profile_image
            ? environment.apiUrl + item.profile_image
            : 'assets/images/no-image.png',
          strStatus: item.status || '--'
        }));
      } else {
        this.arrList = [];
        this.showWarning('No records found.');
      }
    });
  }


  openTestimonialModal(isEdit: boolean, id?: string) {
    this.modalHeader = isEdit ? 'Edit Testimonial' : 'Add Testimonial';
    this.openModal = true;

    if (isEdit && id) {
      this.ID = id;
      this.getTestimonialById(id);
    } else {
      this.TestimonialForm.reset();
      this.imagePreview = null;
      this.showImageBox = false;
      this.ID = '';
    }
  }

  getTestimonialById(id: string) {
    this.Loader = true;
    this.objApiService.handleApiCall('/api/admin/GetTestimonialByID/', { id }, (res) => {
      this.Loader = false;

      if (res.response === 'Success' && res.data) {
        const t = res.data; // backend now uses "data" instead of "testimonial"
        this.TestimonialForm.patchValue({
          name: t.name,
          testimony: t.testimony,
          profile_image: 'preloaded'
        });

        this.imagePreview = t.profile_image
          ? environment.apiUrl + t.profile_image
          : 'assets/images/no-image.png';

        this.fileType = 'image/png';
        this.showImageBox = !!t.profile_image;
      } else {
        this.showWarning('Unable to fetch testimonial details.');
      }
    });
  }

  handleTestimonialOperation() {
    if (this.TestimonialForm.invalid) {
      this.TestimonialForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    if (this.ID) formData.append('id', this.ID);
    formData.append('name', this.TestimonialForm.get('name')?.value);
    formData.append('testimony', this.TestimonialForm.get('testimony')?.value);
    formData.append('createdId', this.adminid);

    const imageFile = this.TestimonialForm.get('profile_image')?.value;
    if (imageFile instanceof File) {
      formData.append('profile_image', imageFile);
    }

    this.Loader = true;
    this.objApiService.handleApiCall('/api/admin/AddEditTestimonial/', formData, (res) => {
      this.Loader = false;

      if (res.response === 'Success') {
        this.showSuccess(res.message || 'Operation successful.');
        this.openModal = false;
        this.getTestimonials();
      } else {
        this.showError(res.message || 'Operation failed.');
      }
    });
  }

  onFileUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.showWarning('Please upload a valid image.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.showWarning('File size must be less than 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview = e.target?.result || '';
      this.showImageBox = true;
      this.fileType = file.type;
      this.TestimonialForm.patchValue({ profile_image: file });
      this.TestimonialForm.get('profile_image')?.updateValueAndValidity();
    };
    reader.readAsDataURL(file);
  }

  clearCard() {
    this.imagePreview = null;
    this.showImageBox = false;
    this.fileType = '';
    this.TestimonialForm.patchValue({ profile_image: null });
  }

  deleteFn() {
    this.Loader = true;
    this.objApiService.handleApiCall('/api/admin/DeleteTestimonial/', { id: this.ID }, (res) => {
      this.Loader = false;

      if (res.response === 'Success') {
        this.showSuccess(res.message || 'Deleted successfully.');
        this.getTestimonials();
        this.deleteModal = false;
      } else {
        this.showError(res.message || 'Deletion failed.');
      }
    });
  }


  // ✅ Toggle Active / Inactive
  toggleActiveInactive(id: number, status: string) {
    this.Loader = true;
    this.objApiService.handleApiCall('/api/admin/UpdateTestimonialStatus/', { id, status }, (res) => {
      this.Loader = false;

      if (res.response === 'Success') {
        this.showSuccess(res.message || 'Status updated.');
      } else {
        this.showError(res.message || 'Failed to update status.');
      }

      this.getTestimonials();
    });
  }

  eventFromTable(event: any) {
    switch (event.strOperation) {
      case 'EDIT_DATA':
        this.openTestimonialModal(true, event.objElement.id);
        break;
      case 'DELETE_DATA':
        this.ID = event.objElement.id;
        this.deleteModal = true;
        break;
      case 'SINGLEVIEW_DATA':
        this.selectedTestimonial = event.objElement;
        this.displaySingleViewModal = true;
        break;
      case 'TOGGLETABLE_DATA':
        this.toggleActiveInactive(event.objElement.id, event.objElement.status);
        break;
    }
  }

  getImageUrl(path: string) {
    return environment.apiUrl + path;
  }

  showSuccess(message: string) {
    Swal.fire({ toast: true, icon: 'success', title: message, position: 'top-end', showConfirmButton: false, timer: 2500 });
  }
  showError(message: string) {
    Swal.fire({ toast: true, icon: 'error', title: message, position: 'top-end', showConfirmButton: false, timer: 2500 });
  }
  showWarning(message: string) {
    Swal.fire({ toast: true, icon: 'warning', title: message, position: 'top-end', showConfirmButton: false, timer: 2500 });
  }
}
