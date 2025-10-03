import { Component } from '@angular/core';
import { TableComponent } from '../../common-table/table/table.component';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiIntegrationService } from '../../../api-service/api-integration.service';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-backup',
  standalone: true,
  imports: [TableComponent,
    ButtonModule,
  ToastModule,
    TableModule,
    CommonModule], templateUrl: './backup.component.html',
  styleUrl: './backup.component.css'
})
export class BackupComponent {
  token: any;
  adminid: any;
  userName: any;
  status: any;
  Loader: boolean = false;

  arrList: any = [];
  arrColumns: any = [
    { strHeader: "Sl. No.", strAlign: "center", strKey: "slNo", field: "slNo" },
    { strHeader: "File Name", strAlign: "center", strKey: "filename", field: "filename" },
    { strHeader: "Date", strAlign: "center", strKey: "date", field: "date" },

    // { strHeader: "Actions", strAlign: "center", strKey: "strActions" }
  ];


  constructor(private formbuilder: FormBuilder, private http: HttpClient, private router: Router, private objApiService: ApiIntegrationService) { }

  ngOnInit(): void {

    this.token = localStorage.getItem("token");
    this.adminid = localStorage.getItem("loginId");
    this.userName = localStorage.getItem("username");
    this.status = localStorage.getItem("status");

    this.getTableFn()

  }


  /**
   * get table
   */
  getTableFn() {
    this.Loader = true;
    this.objApiService.handleApiCall('/api/admin/getbackup/', { id: 'sample' }, (res) => {
      this.Loader = false;
      if (res.response === 'Success' && res.backup_list?.length) {

        this.arrList = res.backup_list.map((obj: any, i: number) => ({ ...obj, slNo: i + 1 }));
      } else if (res.response === 'Warning') {
        this.showWarning(res.message);
        this.arrList = [];
      }
      else if (res.response === 'Error') {
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
 * backup 
 */

  backup() {
    this.Loader = true;

    this.objApiService.handleFileDownload(
      '/api/admin/BackupDatabase/',
      { id: this.adminid },
      (res: ArrayBuffer) => {
        const blob = new Blob([res], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'backup_' + new Date().toISOString() + '.sql';
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showSuccess('Backup completed and file downloaded successfully.');
        this.getTableFn();
      }
    );
  }

  /**
 * backup 
 */



  /**
   * common table event emitter
   */
  eventFromTable(objEvent: any) {
    switch (objEvent.strOperation) {
           default:
        break;
    }
  }
  /**
   * common table event emitter
   */



  reloadCurrentPage() {
    window.location.reload();
  }

  naviagteTo() {
    this.router.navigateByUrl('/super-admin/poems')
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
