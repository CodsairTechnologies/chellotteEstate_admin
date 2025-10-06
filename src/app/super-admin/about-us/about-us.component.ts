import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableComponent } from '../../common-table/table/table.component';
import { ApiIntegrationService } from '../../../api-service/api-integration.service';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, TableComponent],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css'
})
export class AboutUsComponent {
  token: any;
  adminid: any;
  userName: any;
  status: any;
  Loader: boolean = false;

  AboutId!: number;

  OpenModal: boolean = false;
  deleteModal: boolean = false;
  displaySingleViewModal: boolean = false;

  blnHasSingleview = true;
  blnForDelete = true;
  // blnNoEdit = true;

  arrList: any = [];
  arrColumns: any = [
    { strHeader: "Sl. No.", strAlign: "center", strKey: "slNo", sortable: false },
    { strHeader: "Title", strAlign: "center", strKey: "title", sortable: true },
    { strHeader: "Description", strAlign: "center", strKey: "description", sortable: false },
    { strHeader: "Left Image", strAlign: "center", strKey: "image_left", sortable: false },
    { strHeader: "Right Image", strAlign: "center", strKey: "image_right", sortable: false },
    { strHeader: "Status", strAlign: "center", strKey: "strStatus", field: "status" },
    { strHeader: "Actions", strAlign: "center", strKey: "strActions" }
  ];


  AboutForm!: FormGroup;
  modalHeader: string = 'Add About Us';

  id: any;
  leftImagePreview: string | null = null;
  rightImagePreview: string | null = null;
  showLeftImage: boolean = false;
  showRightImage: boolean = false;

  selectedAbout: any = null;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router, private objApiService: ApiIntegrationService, @Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    this.adminid = localStorage.getItem("loginId");

    this.token = localStorage.getItem("token");
    this.adminid = localStorage.getItem("loginId");
    this.userName = localStorage.getItem("username");
    this.status = localStorage.getItem("status");

    this.AboutForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      image_left: [null, Validators.required],
      image_right: [null, Validators.required]
    });

    this.getTableFn();
  }


  //================= get table function ================= 

  getTableFn() {
    this.objApiService.handleApiCall('/api/admin/getEstate/', {}, (res) => {
      console.log('API Response:', res);

      if (res.response?.toLowerCase().trim() === 'success') {
        let estates: any[] = [];

        if (Array.isArray(res.estate)) {
          estates = res.estate;
        } else if (res.estate && typeof res.estate === 'object') {
          estates = [res.estate]; // wrap single object in array
        }

        if (estates.length) {
          const baseUrl = environment.apiUrl.replace(/\/$/, '');
          this.arrList = estates.map((obj: any, i: number) => ({
            id: obj.estateId,           // keep for edit/delete if needed
            estate_id: obj.estateId,    // ✅ needed for toggle calls
            slNo: i + 1,
            title: obj.title,
            description: obj.description,
            image_left: obj.image_left ? `${baseUrl}${obj.image_left}` : null,
            image_right: obj.image_right ? `${baseUrl}${obj.image_right}` : null,
            status: obj.Status?.toLowerCase() === 'active' ? 'Active' : 'Inactive',  // ✅ FIXED
            strStatus: obj.Status?.toLowerCase() === 'active' ? 'Active' : 'Inactive',
            strActions: ''
          }));

          console.log('Mapped arrList:', this.arrList);
        } else {
          this.arrList = [];
          this.showWarning('No estates found.');
        }

      } else if (res.response?.toLowerCase().trim() === 'warning') {
        this.arrList = [];
        this.showWarning(res.message || 'Warning received from server.');
      } else {
        this.arrList = [];
        this.showError(res.message || 'Something went wrong. Please try again.');
      }
    });
  }

  //================= get table function ends ================= 


  openAboutModal(isEdit: boolean, id?: string) {
    this.modalHeader = isEdit ? 'Edit About Us' : 'Add About Us';
    this.OpenModal = true;

    if (isEdit && id) {
      this.id = id;
      this.getById(id);
    } else {
      this.AboutForm.reset();
      this.clearImage('left');
      this.clearImage('right');
      this.id = '';
    }
  }

  openAboutModalForUpdate() {
    if (this.arrList && this.arrList.length > 0) {
      // If a record exists, open modal for edit
      const about = this.arrList[0]; // first/only record
      this.openAboutModal(true, about.id);
    } else {
      // No record exists, open modal for add
      this.openAboutModal(false);
    }
  }

  //================= by id function ================= 

  getById(id: string) {
    this.Loader = true;
    this.objApiService.handleApiCall('/api/admin/getEstatebyid/', { id }, (res) => {
      this.Loader = false;
      if (res.response?.toLowerCase() === 'success') {
        const about = res.estate;
        this.AboutForm.patchValue({
          title: about.title,
          description: about.description,
          image_left: 'preloaded',
          image_right: 'preloaded'
        });
        const baseUrl = environment.apiUrl.replace(/\/$/, '');
        this.leftImagePreview = `${baseUrl}${about.image_left}`;
        this.rightImagePreview = `${baseUrl}${about.image_right}`;
        this.showLeftImage = true;
        this.showRightImage = true;

        // Set selectedAbout for single view modal
        this.selectedAbout = {
          ...about,
          image_left: this.leftImagePreview,
          image_right: this.rightImagePreview
        };
      } else {
        this.showError(res.message || 'Failed to fetch record.');
      }
    });
  }

  //================= by id function ends ================= 


  //================= add and edit function ================= 

  handleAboutOperation() {
    if (this.AboutForm.invalid) {
      this.AboutForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('title', this.AboutForm.get('title')?.value);
    formData.append('description', this.AboutForm.get('description')?.value);
    formData.append('createdId', this.adminid);

    if (this.id) formData.append('id', this.id);

    const leftFile = this.AboutForm.get('image_left')?.value;
    const rightFile = this.AboutForm.get('image_right')?.value;

    if (leftFile instanceof File) formData.append('image_left', leftFile);
    if (rightFile instanceof File) formData.append('image_right', rightFile);

    this.Loader = true;
    this.objApiService.handleApiCall('/api/admin/add_edit_estate/', formData, (res) => {
      this.Loader = false;
      if (res.response?.toLowerCase() === 'success') {
        this.showSuccess(res.message);
        this.getTableFn();
        this.OpenModal = false;
      } else {
        this.showError(res.message || 'Something went wrong.');
      }
    });
  }

  //================= add and edit function ends ================= 

  //================= delete function ================= 

  deleteFn() {
    this.objApiService.handleApiCall('/api/admin/deleteEstate/', { estate_id: this.id }, (res) => {
      if (res.response?.toLowerCase() === 'success') {
        this.showSuccess(res.message);
        this.getTableFn();
        this.deleteModal = false;
      } else {
        this.showError(res.message);
      }
    });
  }

  //================= delete function ends ================= 

  getImageUrl(path: string): string {
    return `${environment.apiUrl}/${path}`;
  }

  // File upload
  onFileUpload(event: any, type: 'left' | 'right') {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.showWarning('Please upload a valid image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (type === 'left') {
        this.leftImagePreview = e.target.result;
        this.showLeftImage = true;
        this.AboutForm.patchValue({ image_left: file });
      } else {
        this.rightImagePreview = e.target.result;
        this.showRightImage = true;
        this.AboutForm.patchValue({ image_right: file });
      }
    };
    reader.readAsDataURL(file);
  }

  clearImage(type: 'left' | 'right') {
    if (type === 'left') {
      this.leftImagePreview = null;
      this.showLeftImage = false;
      this.AboutForm.patchValue({ image_left: null });
    } else {
      this.rightImagePreview = null;
      this.showRightImage = false;
      this.AboutForm.patchValue({ image_right: null });
    }
  }

  //================= toggle function ================= 

  toggleActiveInactive(estate_id: number, status: string) {
    if (!estate_id) {
      console.error('ID is required to update status');
      return;
    }

    this.objApiService.handleApiCall(
      '/api/admin/updateEstatestatus/',
      { estate_id, status },  // Make sure both id and status are passed
      (res) => {
        if (res.response === 'Success') {
          this.showSuccess(res.message);
          this.getTableFn();
        } else {
          this.showError(res.message);
        }
      }
    );
  }

  // Called from checkbox in table
  toggleTableData(rowData: any, event: any) {
    const newStatus = event.target.checked ? 'Active' : 'Inactive';
    this.toggleActiveInactive(rowData.estate_id, newStatus);  // Use lowercase id
  }

  //================= toggle function ends ================= 


  // Table event handler
  eventFromTable(objEvent: any) {
    switch (objEvent.strOperation) {
      case 'EDIT_DATA':
        this.openAboutModal(true, objEvent.objElement.id);
        break;
      case 'DELETE_DATA':
        this.AboutId = objEvent.objElement.id;
        this.deleteModal = true;
        break;
      case 'SINGLEVIEW_DATA':
        this.selectedAbout = objEvent.objElement;
        this.displaySingleViewModal = true;
        break;
      case 'TOGGLETABLE_DATA':
        const newStatus = objEvent.objElement.status;
        const estateId = objEvent.objElement.estate_id; // <-- use snake_case
        this.toggleActiveInactive(estateId, newStatus);
        console.log(objEvent.objElement);
        break;
    }
  }


  // Toasts
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
