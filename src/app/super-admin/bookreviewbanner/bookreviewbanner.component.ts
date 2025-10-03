import { Component } from '@angular/core';
import { TableComponent } from '../../common-table/table/table.component';
import Swal from 'sweetalert2';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiIntegrationService } from '../../../api-service/api-integration.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { AvatarModule } from 'primeng/avatar';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-bookreviewbanner',
  standalone: true,
  imports: [TableComponent,
    ButtonModule,
    InputTextModule,
    ToastModule,
    TableModule,
    ReactiveFormsModule,
    DialogModule,
    AvatarModule,
    CommonModule],
  templateUrl: './bookreviewbanner.component.html',
  styleUrl: './bookreviewbanner.component.css'
})
export class BookreviewbannerComponent {
  token: any;
  adminid: any;
  userName: any;
  status: any;
  Loader: boolean = false;


  OpenModal: boolean = false;
  deleteModal: boolean = false;
  blnHasSingleview: boolean = false;
  blnForDelete: boolean = false;
  blnNoEdit: boolean = true;


  ID: any;
  categorylist: any = [];
  CountryByIdList: any = [];
  adddialogvisible: boolean = false;
  Delete_countryID: any;

  BannerForm !: FormGroup;
  imagePreview: string | ArrayBuffer | null = '';
  showImageBox: boolean = false;

  arrList: any = [];
  id: any;

  arrColumns: any = [
    { strHeader: "Sl. No.", strAlign: "center", strKey: "slNo", field: "slNo" },
    { strHeader: "Image", strAlign: "center", strKey: "bannerurl", field: "bannerurl" },
    { strHeader: "Title", strAlign: "center", strKey: "title", field: "title" },
    { strHeader: "Status", strAlign: "center", strKey: "strStatus", field: "status" },
    { strHeader: "Actions", strAlign: "center", strKey: "strActions" }
  ];


  constructor(private formbuilder: FormBuilder, private http: HttpClient, private router: Router, private objApiService: ApiIntegrationService) { }

  ngOnInit(): void {

    this.token = localStorage.getItem("token");
    this.adminid = localStorage.getItem("loginId");
    this.userName = localStorage.getItem("username");
    this.status = localStorage.getItem("status");

    this.BannerForm = this.formbuilder.group({
      title: ['', [Validators.maxLength(80)]],
      // subtitle: ['', Validators.required],
      // link: ['', [Validators.required]],
      image: [null, this.imageRequiredValidator]
    });

    this.getTableFn()

  }


  imageRequiredValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    // Valid if a File is selected or a preloaded string is used
    if (value instanceof File || value === 'preloaded') {
      return null;
    }

    return { required: true };
  }

  /**
   * get table
   */
getTableFn() {
  this.objApiService.handleApiCall('/api/admin/getbookreviewbanners/', { id: 'sample' }, (res) => {
    if (res.response === 'Success' && res.banners?.length) {
      res.banners.map((obj: any) => {
        obj['imageurl'] = environment.apiUrl + obj['imageurl'];

        // Fallback for title (empty, null, or "null")
        obj['title'] = obj['title'] && obj['title'].toString().trim() && obj['title'] !== 'null'
          ? obj['title']
          : '--';
      });

      this.arrList = res.banners.map((obj: any, i: number) => ({
        ...obj,
        slNo: i + 1
      }));
    } else if (res.response === 'Warning') {
      this.showError(res.message);
      this.arrList = [];
    } else {
      this.showError('Something went wrong. Please try again.');
      this.arrList = [];
    }
  });
}

  /**
 * get table
 */


  /**
   * add & edit fn
   */

  // Open Modal for Add/Edit
  modalHeader: string = 'Add BookReview Banner';
  openCategoryModal(isEdit: boolean, id?: string) {
    this.modalHeader = 'Add BookReview Banner';

    this.OpenModal = true;
    if (isEdit && id) {
      this.id = id;
      this.getCategoryById(this.id);
    } else {
      this.BannerForm.reset();
      this.imagePreview = null;
      this.showImageBox = false;
      this.id = '';
    }
  }

  // Function to get category details by ID (Edit Mode)
  getCategoryById(id: string) {
    this.modalHeader = 'Edit BookReview Banner';
    this.id = id;
    this.Loader = true;

    this.objApiService.handleApiCall('/api/admin/getbookreviewbannerbyid/', { id: this.id }, (response) => {
      this.Loader = false;

      if (response['response'] === 'Success' && response['banner']) {
        const banner = response['banner'];

        this.BannerForm.patchValue({
          title: banner.title || '',
          // subtitle: banner.description || '',
          // link: banner.link || ''
          image: 'preloaded'
        });

        // Set image preview and file type
        const baseUrl = environment.apiUrl;
        const imagePath = banner.bannerurl || '';
        this.imagePreview = baseUrl + imagePath;
        this.fileType = imagePath.endsWith('.mp4') ? 'video/mp4' : 'image/png';
        this.showImageBox = true;

      } else {
        this.showError(response.message || 'Failed to fetch Banner.');
      }
    });
  }


  // Function to handle Add/Edit operation
  handleCategoryOperation() {
    if (this.BannerForm.invalid) {
      this.BannerForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('title', this.BannerForm.get('title')?.value || '');
    // formData.append('description', this.BannerForm.get('subtitle')?.value);
    // formData.append('link', this.BannerForm.get('link')?.value);
    formData.append('createdId', this.adminid);

    if (this.id) {
      formData.append('id', this.id);
    }

    const imageFile = this.BannerForm.get('image')?.value;
    if (imageFile instanceof File) {
      formData.append('bannerurl', imageFile);
    }


    this.Loader = true;

    // Single API endpoint for both Add & Edit
    this.objApiService.handleApiCall('/api/admin/addeditbookreviewbanner/', formData, (response) => {
      this.Loader = false;
      if (response['response'] === 'Success') {
        this.showSuccess(response.message);
        this.BannerForm.reset();
        this.imagePreview = null;
        this.showImageBox = false;
        this.OpenModal = false;
        this.getTableFn()
      } else {
        this.showError(response.message || 'Something went wrong. Please try again.');
      }
    });
  }

  // Function to handle image upload
  // onFileUpload(event: any) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = (e: any) => {
  //       this.imagePreview = e.target.result;
  //       this.showImageBox = true;
  //     };
  //     reader.readAsDataURL(file);
  //     this.BannerForm.patchValue({ image: file });
  //     this.BannerForm.get('image')?.updateValueAndValidity();
  //   }
  // }

  fileType: string = '';

onFileUpload(event: any) {
  const file = event.target.files[0];

  if (file) {
    const fileType = file.type;

    // ✅ Only images allowed
    if (!fileType.startsWith('image/')) {
      this.showWarning('Please upload a valid image.');
      return;
    }

    // ✅ File size validation (5 MB limit)
    const maxSizeInMB = 5;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      this.showWarning(`File size must be less than ${maxSizeInMB} MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        const width = img.width;
        const height = img.height;

        // ✅ Minimum resolution check (16:6 → 1280×480)
        if (width < 1280 || height < 480) {
          this.showWarning('Image must be at least 1280 × 480 pixels.');
          return;
        }

        // ✅ Aspect ratio check (16:6 = 2.66)
        const aspectRatio = width / height;
        const expectedRatio = 16 / 6; // 2.66
        if (Math.abs(aspectRatio - expectedRatio) > 0.01) {
          this.showWarning('Image must have a 16:6 aspect ratio.');
          return;
        }

        // ✅ If valid, set preview and update form
        this.imagePreview = e.target.result;
        this.showImageBox = true;
        this.fileType = fileType;

        this.BannerForm.patchValue({ image: file });
        this.BannerForm.get('image')?.updateValueAndValidity();
      };
    };

    reader.readAsDataURL(file);
  }
}




  // Function to clear image preview
  clearCard() {
    this.imagePreview = null;
    this.showImageBox = false;
    this.BannerForm.patchValue({ image: null });
    this.BannerForm.get('image')?.updateValueAndValidity();
  }


  /**
 * add & edit fn
 */


  /**
 * delete 
 */
  deleteFn() {
    if (!this.ID) {
      console.error('ID is missing');
      return;
    }
    this.objApiService.handleApiCall('/api/admin/deletebookreviewbanner/', { id: this.ID }, (res) => {
      if (res.response === 'Success') {
        this.showSuccess(res.message);
        this.getTableFn();
        this.deleteModal = false;
      } else {
        this.showError(res.message);
      }
    });
  }


  /**
 * delete 
 */

  /**
 * status change 
 */
  toggleActiveInactive(id: number, status: string) {
    this.objApiService.handleApiCall('/api/admin/updatebookreviewbannerstatus/', { id, status }, (res) => {
      if (res.response === 'Success') {
        this.showSuccess(res.message);
        this.getTableFn();
      } else this.showError(res.message);
    });
  }
  /**
   * status change
   */

  toggleTableData(rowData: any, event: any) {
    const newStatus = event.target.checked ? 'Active' : 'Inactive';
    this.toggleActiveInactive(rowData.id, newStatus);
  }
  /** status active and inactive fn*/


  /**
   * common table event emitter
   */

  bannerId: any;

  eventFromTable(objEvent: any) {
    switch (objEvent.strOperation) {
      case 'EDIT_DATA':
        this.showModalDialog()
        this.ID = objEvent.objElement.id;
        this.getCategoryById(this.ID);
        break;

      case 'DELETE_DATA':
        this.showDeleteDialog()
        console.log(objEvent.objElement.id)
        this.ID = objEvent.objElement.id;
        break;

      // case 'TOGGLETABLE_DATA':
      //   const newStatus = objEvent.objElement.toggle ? 'Active' : 'Inactive';
      //   this.toggleActiveInactive(objEvent.objElement.id, newStatus);
      //   console.log(objEvent.objElement)
      //   break;


      case 'TOGGLETABLE_DATA':
        const newStatus = objEvent.objElement.status;
        this.toggleActiveInactive(objEvent.objElement.id, newStatus);
        console.log(objEvent.objElement);
        break;


      default:
        break;
    }
  }
  /**
   * common table event emitter
   */

  showDeleteDialog() {
    this.deleteModal = true
  }
  showModalDialog() {
    this.OpenModal = true;
  }


  reloadCurrentPage() {
    window.location.reload();
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
