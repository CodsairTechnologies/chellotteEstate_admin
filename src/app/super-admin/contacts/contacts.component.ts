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
  selector: 'app-contacts',
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
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.css'
})
export class ContactsComponent {
  token: any;
  adminid: any;
  userName: any;
  status: any;
  Loader: boolean = false;


  OpenModal: boolean = false;
  deleteModal: boolean = false;
  blnHasSingleview: boolean = true;
  blnForDelete: boolean = false;
  blnNoEdit: boolean = false;


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
    { strHeader: "Name", strAlign: "center", strKey: "name", field: "name" },
    { strHeader: "Email", strAlign: "center", strKey: "email", field: "email" },
    { strHeader: "Ph No.", strAlign: "center", strKey: "phoneNumber", field: "phoneNumber" },
    { strHeader: "Message", strAlign: "center", strKey: "message", field: "message" },
  ];


  constructor(private formbuilder: FormBuilder, private http: HttpClient, private router: Router, private objApiService: ApiIntegrationService) { }

  ngOnInit(): void {

    this.token = localStorage.getItem("token");
    this.adminid = localStorage.getItem("loginId");
    this.userName = localStorage.getItem("username");
    this.status = localStorage.getItem("status");

    this.getTableFn()

  }



  getTableFn() {
    this.Loader = true;
    this.objApiService.handleApiCall('/api/admin/getAll_enquiry/', { id: 'sample' }, (res) => {
      this.Loader = false;
      if (res.response === 'Success' && res.enquiry?.length) {
        res.enquiry.map((obj: { [x: string]: any; }, index: number) => {
          obj['imageurl'] = environment.apiUrl + obj['imageurl'];

        });
        this.arrList = res.enquiry.map((obj: any, i: number) => ({ ...obj, slNo: i + 1 }));
      } else if (res.response === 'Warning') {
        this.showWarning(res.message);
        this.arrList = [];
      } else {
        this.showError('Something went wrong. Please try again.');
        this.arrList = [];
      }
    });
  }



  eventFromTable(objEvent: any) {
    switch (objEvent.strOperation) {
      case 'EDIT_DATA':
        this.showModalDialog()
        this.ID = objEvent.objElement.id;
        this.router.navigate(['/super-admin/poems'], {
          queryParams: { id: this.ID },
        });
        break;

      case 'DELETE_DATA':
        this.showDeleteDialog()
        console.log(objEvent.objElement.id)
        this.ID = objEvent.objElement.id;
        break;

      case 'SINGLEVIEW_DATA':
        const id = objEvent.objElement.id;

        this.router.navigate(['/super-admin/viewpoems'], {
          queryParams: { id: id },
        });

        // Navigate to view page
        // this.router.navigate(['/super-admin/viewproduct']);
        break;



      // case 'TOGGLETABLE_DATA':
      //   const newStatus = objEvent.objElement.status;
      //   this.toggleActiveInactive(objEvent.objElement.id, newStatus);
      //   console.log(objEvent.objElement);
      //   break;
      default:
        break;
    }
  }


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

