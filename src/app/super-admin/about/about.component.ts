import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { TableComponent } from '../../common-table/table/table.component';
import { ApiIntegrationService } from '../../../api-service/api-integration.service';
import { environment } from '../../../environments/environment';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    TableComponent,
    ButtonModule,
    InputTextModule,
    ToastModule,
    TableModule,
    ReactiveFormsModule,
    DialogModule,
    AvatarModule,
    CommonModule
  ],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {

  token: any;
  adminid: any;
  Loader: boolean = false;

  OpenModal: boolean = false;
  deleteModal: boolean = false;
  blnHasSingleview: boolean = true;
  blnForDelete: boolean = true;
  // blnNoEdit: boolean = true;

  AboutForm!: FormGroup;
  imagePreview: any = {};
  showImageBox: any = { sec1_image: false, sec2_image: false, sec3_image: false };
  arrList: any[] = [];
  arrColumns: any[] = [
    { strHeader: "Sl. No.", strAlign: "center", strKey: "slNo", field: "slNo" },
    { strHeader: "Section 1 Heading", strAlign: "center", strKey: "sec1_heading", field: "sec1_heading" },
    { strHeader: "Section 2 Heading", strAlign: "center", strKey: "sec2_heading", field: "sec2_heading" },
    { strHeader: "Section 3 Heading", strAlign: "center", strKey: "sec3_heading", field: "sec3_heading" },
    { strHeader: "Years of Experience", strAlign: "center", strKey: "years_of_experience", field: "years_of_experience" },
    { strHeader: "Status", strAlign: "center", strKey: "strStatus", field: "status" },
    { strHeader: "Actions", strAlign: "center", strKey: "strActions" }
  ];

  modalHeader: string = 'Add About Page';
  selectedAbout: any = null;
  displaySingleViewModal: boolean = false;
  AboutId: any;

  constructor(private formbuilder: FormBuilder, private http: HttpClient, private router: Router, private objApiService: ApiIntegrationService) { }

  ngOnInit(): void {
    this.token = localStorage.getItem("token");
    this.adminid = localStorage.getItem("loginId");

    this.AboutForm = this.formbuilder.group({
  box_title: ['', [Validators.required]],   // ✅ Added
  box_description: [''],

  sec1_heading: ['', [Validators.required]],
  sec1_subheading: [''],
  sec1_description: [''],                   // ✅ Added
  sec1_image: [null, this.imageRequiredValidator],

  sec2_heading: [''],
  sec2_subheading: [''],
  sec2_description: [''],                   // ✅ Added
  sec2_image: [''],

  sec3_heading: [''],
  sec3_subheading: [''],
  sec3_description: [''],                   // ✅ Added
  sec3_image: [''],

  years_of_experience: [''],
  createdId: [this.adminid]
});



    this.getAboutList();
  }

  onFileUpload(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview[field] = e.target.result;
        this.showImageBox[field] = true;
      };
      reader.readAsDataURL(file);
      this.AboutForm.patchValue({ [field]: file });
      this.AboutForm.get(field)?.updateValueAndValidity();
    }
  }


  imageRequiredValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value instanceof File || value === 'preloaded') return null;
    return { required: true };
  }

  // ================= table function ================= 

  getAboutList() {
    this.Loader = true;
    this.objApiService.handleApiCall('/api/admin/GetAboutPage/', {}, (res) => {
      this.Loader = false;

      if (res.response?.toLowerCase() === 'success' && Array.isArray(res.data) && res.data.length) {
        const baseUrl = environment.apiUrl.replace(/\/$/, '');
        this.arrList = res.data.map((item: any, i: number) => ({
          ...item,
          slNo: i + 1,
          sec1_image: item.sec1_image ? `${baseUrl}/${item.sec1_image}` : null,
          sec2_image: item.sec2_image ? `${baseUrl}/${item.sec2_image}` : null,
          sec3_image: item.sec3_image ? `${baseUrl}/${item.sec3_image}` : null,
          status: item.status || 'Inactive'
        }));
        console.log('Mapped arrList:', this.arrList);
      } else {
        this.arrList = [];
        this.showWarning(res.message || 'No data found');
      }
    });
  }

  // ================= table function ends ================= 

  // ================= by id function ================= 
  openAboutModal(isEdit: boolean = false, id?: any) {
    this.modalHeader = isEdit ? 'Update About Page' : 'Add About Page';
    this.OpenModal = true;

    if (isEdit && id) {
      this.AboutId = id;
      this.objApiService.handleApiCall('/api/admin/GetAboutPageById/', { id }, (res) => {
        if (res.response?.toLowerCase() === 'success' && res.data) {
          const about = res.data; // ✅ directly use the object

          // Patch form values
          this.AboutForm.patchValue({
  box_title: about.box_title,
  box_description: about.box_description,

  sec1_heading: about.sec1_heading,
  sec1_subheading: about.sec1_subheading,
  sec1_description: about.sec1_description,

  sec2_heading: about.sec2_heading,
  sec2_subheading: about.sec2_subheading,
  sec2_description: about.sec2_description,

  sec3_heading: about.sec3_heading,
  sec3_subheading: about.sec3_subheading,
  sec3_description: about.sec3_description,

  years_of_experience: about.years_of_experience,
  sec1_image: about.sec1_image ? 'preloaded' : '',
  sec2_image: about.sec2_image ? 'preloaded' : '',
  sec3_image: about.sec3_image ? 'preloaded' : ''
});


          const baseUrl = environment.apiUrl.replace(/\/$/, '');

          // Set image previews
          this.imagePreview = {
            sec1_image: about.sec1_image ? `${baseUrl}/${about.sec1_image}` : null,
            sec2_image: about.sec2_image ? `${baseUrl}/${about.sec2_image}` : null,
            sec3_image: about.sec3_image ? `${baseUrl}/${about.sec3_image}` : null
          };

          // Show image boxes if images exist
          this.showImageBox = {
            sec1_image: !!about.sec1_image,
            sec2_image: !!about.sec2_image,
            sec3_image: !!about.sec3_image
          };
        } else {
          this.showError(res.message || 'Failed to fetch About Page.');
        }

      });
    } else {
      // Reset form for Add
      this.AboutForm.reset();
      this.showImageBox = { sec1_image: false, sec2_image: false, sec3_image: false };
      this.imagePreview = {};
      this.AboutId = null;
    }
  }

  // ================= by id ends ================= 

  openAboutModalForUpdate() {
    if (this.arrList && this.arrList.length > 0) {
      // If data exists, open modal in edit mode with the first record
      const about = this.arrList[0];
      this.openAboutModal(true, about.id);
    } else {
      // If no data, open modal in add mode
      this.openAboutModal(false);
    }
  }


  // ================= add edit function ================= 

  handleAboutOperation() {
    if (this.AboutForm.invalid) {
      this.AboutForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();

    Object.keys(this.AboutForm.controls).forEach(key => {
      const value = this.AboutForm.get(key)?.value;
      if (value instanceof File || value === 'preloaded') {
        formData.append(key, value);
      } else {
        formData.append(key, value || '');
      }
    });

    if (this.AboutId) formData.append('id', this.AboutId);

    this.Loader = true;
    this.objApiService.handleApiCall('/api/admin/AddEditAboutPage/', formData, (res) => {
      this.Loader = false;
      if (res.response?.toLowerCase() === 'success') {  // <-- case-insensitive
        this.showSuccess(res.message);
        this.OpenModal = false;  // close modal
        this.getAboutList();     // refresh table
        this.AboutForm.reset();
        this.imagePreview = {};
        this.showImageBox = { sec1_image: false, sec2_image: false, sec3_image: false };
        this.AboutId = null;
      } else {
        this.showError(res.message || 'Operation failed');
      }
    });

  }

  // ================= add edit ends ================= 

  // ================= delete function ================= 

  deleteAbout(id: any) {
    this.objApiService.handleApiCall('/api/admin/DeleteAboutPage/', { id }, (res) => {
      if (res.response?.toLowerCase() === 'success') {  // <-- case-insensitive
        this.showSuccess(res.message);
        this.deleteModal = false;  // close delete modal
        this.getAboutList();        // refresh table
      } else this.showError(res.message);
    });
  }

  // ================= delete function ends ================= 

  //================= toggle function ================= 

  toggleActiveInactive(id: number, status: string) {
    if (!id) {
      console.error('ID is required to update status');
      return;
    }

    this.objApiService.handleApiCall(
      '/api/admin/UpdateAboutPageStatus/',
      { id, status },  // Make sure both id and status are passed
      (res) => {
        if (res.response === 'Success') {
          this.showSuccess(res.message);
          this.getAboutList();
        } else {
          this.showError(res.message);
        }
      }
    );
  }

  // Called from checkbox in table
  toggleTableData(rowData: any, event: any) {
    const newStatus = event.target.checked ? 'Active' : 'Inactive';
    this.toggleActiveInactive(rowData.id, newStatus);  // Use lowercase id
  }

  // ================= toggle ends ================= 

  removeImage(field: string) {
    this.imagePreview[field] = null;
    this.showImageBox[field] = false;
    this.AboutForm.get(field)?.setValue(null); // clear form control
  }


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
        const id = objEvent.objElement.id ?? objEvent.objElement.Id; // ensure correct key
        this.toggleActiveInactive(id, newStatus);
        console.log(objEvent.objElement);
        break;
    }
  }

  // toast

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

