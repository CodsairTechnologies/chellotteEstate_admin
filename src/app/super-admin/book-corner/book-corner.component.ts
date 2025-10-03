import { Component } from '@angular/core';
import { TableComponent } from '../../common-table/table/table.component';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  selector: 'app-book-corner',
  standalone: true,
  imports: [TableComponent,
    ButtonModule,
    InputTextModule,
    ToastModule,
    TableModule,
    ReactiveFormsModule,
    DialogModule,
    AvatarModule,
    CommonModule], templateUrl: './book-corner.component.html',
  styleUrl: './book-corner.component.css'
})
export class BookCornerComponent {
  token: any;
  adminid: any;
  userName: any;
  status: any;
  Loader: boolean = false;


  OpenModal: boolean = false;
  deleteModal: boolean = false;
  blnHasSingleview: boolean = true;
  blnForDelete: boolean = true;
  blnNoEdit: boolean = true;


  ID: any;
  categorylist: any = [];
  CountryByIdList: any = [];
  adddialogvisible: boolean = false;
  Delete_countryID: any;

  BookcornerForm !: FormGroup;
  imagePreview: string | ArrayBuffer | null = '';
  showImageBox: boolean = false;

  arrList: any = [];
  id: any;

  selectedBookcorner: any = null;
  displaySingleViewModal: boolean = false;


  arrColumns: any = [
    { strHeader: "Sl. No.", strAlign: "center", strKey: "slNo", field: "slNo" },
    { strHeader: "Book", strAlign: "center", strKey: "bookcoverimage", field: "bookcoverimage" },
    { strHeader: "Book Title", strAlign: "center", strKey: "booktitle", field: "booktitle" },
    { strHeader: "Author", strAlign: "center", strKey: "writername", field: "writername" },
    // { strHeader: "Link", strAlign: "center", strKey: "link", field: "link" },
    { strHeader: "Status", strAlign: "center", strKey: "strStatus", field: "status" },
    { strHeader: "Actions", strAlign: "center", strKey: "strActions" }
  ];


  constructor(private formbuilder: FormBuilder, private http: HttpClient, private router: Router, private objApiService: ApiIntegrationService) { }

  ngOnInit(): void {

    this.token = localStorage.getItem("token");
    this.adminid = localStorage.getItem("loginId");
    this.userName = localStorage.getItem("username");
    this.status = localStorage.getItem("status");

    this.BookcornerForm = this.formbuilder.group({
      image: [null, Validators.required],
      title: ['', Validators.required],
      author: ['', Validators.required],
      link: ['', Validators.required],
      description: ['', Validators.required],
      spotlight: [false],
    });

    this.getTableFn()

  }


  /**
   * get table
   */
  getTableFn() {
    this.objApiService.handleApiCall('/api/admin/getbookcorner/', { id: 'sample' }, (res) => {
      if (res.response === 'Success' && res.bookcorner?.length) {
        res.bookcorner.map((obj: { [x: string]: any; }, index: number) => {
          obj['imageurl'] = environment.apiUrl + obj['imageurl'];

        });
        this.arrList = res.bookcorner.map((obj: any, i: number) => ({ ...obj, slNo: i + 1 }));
      } else if (res.response === 'Warning') {
        this.showWarning(res.message);
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
  modalHeader: string = 'Add Bookcorner';
  openCategoryModal(isEdit: boolean, id?: string, BookcornerId?: string) {
    this.modalHeader = 'Add Bookcorner';

    this.OpenModal = true;
    if (isEdit && id && BookcornerId) {
      this.id = id;
      this.bookcornerbyid(this.id, this.BookcornerId);
    } else {
      this.BookcornerForm.reset();
      this.imagePreview = null;
      this.showImageBox = false;
      this.id = '';
    }
  }

  // Function to get category details by ID (Edit Mode)
  bookcornerbyid(id: string, BookcornerId: string, mode: 'edit' | 'view' = 'edit') {
    this.Loader = true;

    this.objApiService.handleApiCall(
      '/api/admin/getbookcornerbyid/',
      { id, Bookcorner_id: BookcornerId },
      (response) => {
        this.Loader = false;

        if (response['response'] === 'Success' && response['bookcorner']) {
          const Bookcorner = response['bookcorner'];

          if (mode === 'edit') {
            this.modalHeader = 'Edit Bookcorner';
            this.id = id;
            this.BookcornerId = BookcornerId;

            this.BookcornerForm.patchValue({
              author: Bookcorner.writername || '',
              title: Bookcorner.booktitle || '',
              link: Bookcorner.link || '',
              description: Bookcorner.content || '',
              spotlight: Bookcorner.isspotlight === 'Yes'
            });

            const baseUrl = environment.apiUrl;
            const imagePath = Bookcorner.bookcoverimage || '';

            if (imagePath) {
              this.imagePreview = baseUrl + imagePath;
              this.fileType = 'image/png';
              this.showImageBox = true;

              this.BookcornerForm.patchValue({ image: baseUrl + imagePath });
            }
            else {
              this.imagePreview = '';
              this.showImageBox = false;
            }
          }

          // 🟢 Handle "view" mode for Single View Modal
          if (mode === 'view') {
            this.selectedBookcorner = Bookcorner;
            this.displaySingleViewModal = true;
          }

        } else {
          this.showError(response.message || 'Failed to fetch Bookcorner.');
        }
      }
    );
  }

  openSingleViewModal(id: string, BookcornerId: string) {
    this.bookcornerbyid(id, BookcornerId, 'view');
  }

  async fetchImageAsFile(url: string, fileName: string): Promise<File> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type });
  }

  // Function to handle Add/Edit operation
  async handleCategoryOperation() {
    if (this.BookcornerForm.invalid) {
      this.BookcornerForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('booktitle', this.BookcornerForm.get('title')?.value);
    formData.append('writername', this.BookcornerForm.get('author')?.value);
    formData.append('link', this.BookcornerForm.get('link')?.value);
    formData.append('content', this.BookcornerForm.get('description')?.value);

    formData.append('createdId', this.adminid);

    if (this.BookcornerForm.get('spotlight')?.value) {
      formData.append('isspotlight', 'Yes');
    } else {
      formData.append('isspotlight', 'No');
    }

    if (this.id) {
      formData.append('bookcorner_id', this.id);
    }

    const imageValue = this.BookcornerForm.get('image')?.value;

    if (imageValue instanceof File) {
      formData.append('bookcoverimage', imageValue);
    } else if (typeof imageValue === 'string' && imageValue.startsWith('http')) {
      const file = await this.fetchImageAsFile(imageValue, 'bookcover.png');
      formData.append('bookcoverimage', file);
    }

    // const imageFile = this.BookcornerForm.get('image')?.value;
    // if (imageFile instanceof File) {
    //   formData.append('bookcoverimage', imageFile);
    // }


    this.Loader = true;

    // Single API endpoint for both Add & Edit
    this.objApiService.handleApiCall('/api/admin/addeditbookcorner/', formData, (response) => {
      this.Loader = false;
      if (response['response'] === 'Success') {
        this.showSuccess(response.message);
        this.BookcornerForm.reset();
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
  //     this.BookcornerForm.patchValue({ image: file });
  //     this.BookcornerForm.get('image')?.updateValueAndValidity();
  //   }
  // }

  fileType: string = '';

  onFileUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const fileType = file.type;
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.showImageBox = true;
        this.fileType = fileType;
      };

      reader.readAsDataURL(file);
      this.BookcornerForm.patchValue({ image: file });
      this.BookcornerForm.get('image')?.updateValueAndValidity();
    }
  }



  // Function to clear image preview
  clearCard() {
    this.imagePreview = null;
    this.showImageBox = false;
    this.BookcornerForm.patchValue({ image: null });
    this.BookcornerForm.get('image')?.updateValueAndValidity();
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
    this.objApiService.handleApiCall('/api/admin/deletebookcorner/', { id: this.ID }, (res) => {
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
    this.objApiService.handleApiCall('/api/admin/updatebookcornerstatus/', { id, status }, (res) => {
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

  getImageUrl(path: string): string {
    if (!path) return '';
    return `${environment.apiUrl}/${path}`;

    // const baseUrl = environment.apiUrl.replace(/\/$/, '');
    // return path.startsWith('http') ? path : `${baseUrl}${path}`;
  }


  /**
   * common table event emitter
   */

  BookcornerId: any;

  eventFromTable(objEvent: any) {
    switch (objEvent.strOperation) {
      case 'EDIT_DATA':
        this.showModalDialog();
        this.ID = objEvent.objElement.id;
        this.BookcornerId = objEvent.objElement.BookcornerId;
        this.bookcornerbyid(this.ID, this.BookcornerId, 'edit'); // 👈 Pass 'edit'
        break;

      case 'DELETE_DATA':
        this.showDeleteDialog();
        console.log(objEvent.objElement.id);
        this.ID = objEvent.objElement.id;
        break;

      case 'SINGLEVIEW_DATA':
        this.ID = objEvent.objElement.id;
        this.BookcornerId = objEvent.objElement.BookcornerId;
        this.bookcornerbyid(this.ID, this.BookcornerId, 'view'); // 👈 Pass 'view'
        break;

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
