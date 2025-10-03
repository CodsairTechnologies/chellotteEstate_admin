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
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-home-bookreview',
  standalone: true,
  imports: [TableComponent,
    ButtonModule,
    InputTextModule,
    ToastModule,
    TableModule,
    ReactiveFormsModule,
    DialogModule,
    AvatarModule,
    QuillModule,
    CommonModule], templateUrl: './home-bookreview.component.html',
  styleUrl: './home-bookreview.component.css'
})
export class HomeBookreviewComponent {

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

  BookReviewForm !: FormGroup;
  imagePreview: string | ArrayBuffer | null = '';
  showImageBox: boolean = false;

  arrList: any = [];
  id: any;


  arrColumns: any = [
    { strHeader: "SlNo", strAlign: "center", strKey: "slNo", field: "slNo" },
    { strHeader: "Image", strAlign: "center", strKey: "image", field: "image" },
    { strHeader: "Content", strAlign: "center", strKey: "description", field: "description" },
    { strHeader: "Status", strAlign: "center", strKey: "strStatus", },
    { strHeader: "Actions", strAlign: "center", strKey: "strActions", },

  ]

  constructor(private formbuilder: FormBuilder, private http: HttpClient, private router: Router, private objApiService: ApiIntegrationService) { }

  ngOnInit(): void {

    this.token = localStorage.getItem("token");
    this.adminid = localStorage.getItem("loginId");
    this.userName = localStorage.getItem("username");
    this.status = localStorage.getItem("status");

    this.BookReviewForm = this.formbuilder.group({
      image: ['', Validators.required],
      content: ['', Validators.required],
    });

    this.getReviewList()

  }


  contentTooLong: boolean = false;
  maxLength: number = 500;

  onEditorContentChanged(event: any) {
    const text = event.text.trim(); // Remove trailing newline
    this.contentTooLong = text.length > this.maxLength;

    if (this.contentTooLong) {
      // Optionally restrict content
      const trimmedText = text.substring(0, this.maxLength);
      const delta = event.editor.clipboard.convert(trimmedText);
      event.editor.setContents(delta); // Sets trimmed content to editor
      this.BookReviewForm.get('content')?.setValue(trimmedText);
    }
  }




  /**
   * get table
   */
  getReviewList() {
    this.objApiService.handleApiCall('/api/admin/gethomebookreview/', { id: 'sample' }, (res) => {
      if (res.response === 'Success' && res.reviews?.length) {
        res.reviews.map((obj: { [x: string]: any; }, index: number) => {
          obj['imageurl'] = environment.apiUrl + obj['imageurl'];

        });
        this.arrList = res.reviews.map((obj: any, i: number) => ({ ...obj, slNo: i + 1 }));
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
  modalHeader: string = 'Add BookReview Banner';
  openCategoryModal(isEdit: boolean, id?: string) {
    this.modalHeader = 'Add BookReview Banner';

    this.OpenModal = true;
    if (isEdit && id) {
      this.id = id;
      this.bookreviewbyid(this.id);
    } else {
      this.BookReviewForm.reset();
      this.imagePreview = null;
      this.showImageBox = false;
      this.id = '';
    }
  }

  // Function to get category details by ID (Edit Mode)
  bookreviewbyid(id: string) {
    this.modalHeader = 'Edit BookReview Banner';
    this.id = id;
    this.Loader = true;

    this.objApiService.handleApiCall('/api/admin/gethomebookreviewbyid/', { id: this.id }, (response) => {
      this.Loader = false;

      if (response['response'] === 'Success' && response['review']) {
        const review = response['review']; // ✅ Correct access

        this.BookReviewForm.patchValue({
          content: review.description || '',
          image: review.image || ''
        });

        // ✅ Properly construct preview URL
        this.imagePreview = environment.apiUrl + review.image;
        this.showImageBox = true;

        // ✅ File type detection
        const ext = review.image?.split('.').pop()?.toLowerCase() || '';
        this.fileType = ext === 'mp4' ? 'video/mp4' : 'image/png';

      } else {
        this.showError(response.message || 'Failed to fetch review.');
      }
    });
  }




  // Function to handle Add/Edit operation
  handleBookReview() {
    if (this.BookReviewForm.invalid) {
      this.BookReviewForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('description', this.BookReviewForm.get('content')?.value);
    formData.append('createdId', this.adminid); // optional

    const imageFile = this.BookReviewForm.get('image')?.value;
    if (imageFile instanceof File) {
      formData.append('image', imageFile);
    }

    if (this.ID) {
      formData.append('review_id', this.ID); // ← Corrected this line
    }

    this.Loader = true;
    this.objApiService.handleApiCall('/api/admin/addedithomebookreview/', formData, (response) => {
      this.Loader = false;
      if (response['response'] === 'Success') {
        this.showSuccess(response.message);
        this.BookReviewForm.reset();
        this.imagePreview = null;
        this.showImageBox = false;
        this.OpenModal = false;
        this.ID = ''; // Reset ID
        this.getReviewList(); // Reload list
      } else {
        this.showError(response.message || 'Something went wrong.');
      }
    });
  }




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
      this.BookReviewForm.patchValue({ image: file });
      this.BookReviewForm.get('image')?.updateValueAndValidity();
    }
  }



  // Function to clear image preview
  clearCard() {
    this.imagePreview = null;
    this.showImageBox = false;
    this.BookReviewForm.patchValue({ image: null });
    this.BookReviewForm.get('image')?.updateValueAndValidity();
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
    this.objApiService.handleApiCall('/api/admin/deletehomebookreview/', { id: this.ID }, (res) => {
      if (res.response === 'Success') {
        this.showSuccess(res.message);
        this.getReviewList();
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
    this.objApiService.handleApiCall('/api/admin/updatehomebookreviewstatus/', { id, status }, (res) => {
      if (res.response === 'Success') {
        this.showSuccess(res.message);
        this.getReviewList();
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
  eventFromTable(objEvent: any) {
    switch (objEvent.strOperation) {
      case 'EDIT_DATA':
        this.showModalDialog()
        this.ID = objEvent.objElement.id;
        this.bookreviewbyid(this.ID);
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
