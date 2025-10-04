import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import Swal from 'sweetalert2';
import { ApiIntegrationService } from '../../../api-service/api-integration.service';
import { TableComponent } from '../../common-table/table/table.component';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule,
    TableComponent,
    ButtonModule,
    DialogModule,
    TableModule,
    ToastModule,
    ReactiveFormsModule],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.css'
})
export class TimelineComponent {
  token: any;
  adminid: any;
  Loader: boolean = false;
  status: any;

  OpenModal: boolean = false;
  deleteModal: boolean = false;
  displaySingleViewModal: boolean = false;

  blnHasSingleview: boolean = true;
  blnForDelete: boolean = true;
  blnNoEdit: boolean = true;

  modalHeader: string = 'Add Timeline';
  arrList: any = [];
  arrColumns: any = [
    { strHeader: "Sl. No.", strAlign: "center", strKey: "slNo", field: "slNo" },
    { strHeader: "Title", strAlign: "center", strKey: "title", field: "title" },
    { strHeader: "Date", strAlign: "center", strKey: "date", field: "date" },
    { strHeader: "Status", strAlign: "center", strKey: "strStatus", field: "status" },
    { strHeader: "Actions", strAlign: "center", strKey: "strActions" }
  ];

  TimelineForm!: FormGroup;
  selectedTimeline: any = null;
  ID: any;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiIntegrationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.token = localStorage.getItem('token');
      this.adminid = localStorage.getItem('loginId');
      this.status = localStorage.getItem("status");
    }

    this.TimelineForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required]],
      fromDate: ['', Validators.required],
      toDate: ['']
    });

    this.getTimelineTable();
  }

  getTimelineTable() {
    this.Loader = true;
    this.apiService.handleApiCall('/api/admin/getTimeline/', {}, (res) => {
      this.Loader = false;
      const timelines = res.timeline || res.timelines || [];
      if (res.response === 'Success' && timelines.length) {
        this.arrList = timelines.map((t: any, i: number) => ({
          ...t,
          slNo: i + 1,
          date: t.year_or_period || '--',   // <--- add this
          status: t.Status || '--'
        }));
      } else {
        this.arrList = [];
        this.showWarning(res.message || 'No records found.');
      }

    });
  }

  openTimelineModal(isEdit: boolean, id?: string) {
    this.modalHeader = isEdit ? 'Edit Timeline' : 'Add Timeline';
    this.OpenModal = true;

    if (isEdit && id) {
      this.ID = id;
      this.getTimelineById(id);
    } else {
      this.TimelineForm.reset();
      this.ID = '';
    }
  }

  getTimelineById(id: string) {
    this.Loader = true;
    const payload = {
      timelineId: this.ID || '',
    };
    this.apiService.handleApiCall('/api/admin/getTimelinebyid/', payload, (res) => {
      this.Loader = false;
      if (res.response === 'Success' && res.timeline) {
        const timeline = res.timeline;
        const period = timeline.year_or_period?.split(' - ') || [];
        this.TimelineForm.patchValue({
          title: timeline.title,
          description: timeline.description,
          fromDate: period[0] || '',
          toDate: period[1] || ''
        });
      } else {
        this.showError(res.message || 'Failed to fetch timeline.');
      }
    });
  }

  handleTimelineOperation() {
    if (this.TimelineForm.invalid) {
      this.TimelineForm.markAllAsTouched();
      return;
    }

    const from = this.TimelineForm.value.fromDate;
    const to = this.TimelineForm.value.toDate;
    const year_or_period = to ? `${from} - ${to}` : from;

    const payload = {
      timelineId: this.ID || '',
      title: this.TimelineForm.value.title,
      description: this.TimelineForm.value.description,
      year_or_period,
      createdId: this.adminid
    };

    this.Loader = true;
    this.apiService.handleApiCall('/api/admin/add_edit_Timeline/', payload, (res) => {
      this.Loader = false;
      if (res.response === 'Success') {
        this.showSuccess(res.message || 'Timeline saved successfully');
        this.OpenModal = false;
        this.getTimelineTable();
      } else {
        this.showError(res.message || 'Something went wrong.');
      }
    });
  }

  deleteFn() {
    this.Loader = true;
    this.apiService.handleApiCall('/api/admin/deleteTimeline/', { timeline_id: this.ID }, (res) => {
      this.Loader = false;
      if (res.response === 'Success') {
        this.showSuccess(res.message);
        this.deleteModal = false;
        this.getTimelineTable();
      } else {
        this.showError(res.message);
      }
    });
  }

  /**
 * status change 
 */
  toggleActiveInactive(timeline_id: string, status: string) {
    if (!timeline_id || !status) {
      this.showError('timeline_id and status are required');
      return;
    }

    this.apiService.handleApiCall('/api/admin/updateTimelinestatus/', { timeline_id, status }, (res) => {
      if (res.response === 'Success') {
        this.showSuccess(res.message);
        this.getTimelineTable(); // refresh table
      } else {
        this.showError(res.message);
      }
    });
  }

  /**
   * status change
   */

  eventFromTable(event: any) {
    switch (event.strOperation) {
      case 'EDIT_DATA':
        this.openTimelineModal(true, event.objElement.timelineId);
        break;

      case 'DELETE_DATA':
        this.deleteModal = true;
        this.ID = event.objElement.timelineId;
        break;

      case 'SINGLEVIEW_DATA':
        this.selectedTimeline = event.objElement;
        this.displaySingleViewModal = true;
        break;

      case 'TOGGLETABLE_DATA':
        const newStatus = event.objElement.status; // this is already the toggled value
        this.toggleActiveInactive(event.objElement.timelineId, newStatus); // use timelineId
        break;


    }
  }

  showSuccess(msg: string) {
    Swal.fire({ toast: true, icon: 'success', title: msg, timer: 2000, position: 'top-end', showConfirmButton: false });
  }

  showError(msg: string) {
    Swal.fire({ toast: true, icon: 'error', title: msg, timer: 2000, position: 'top-end', showConfirmButton: false });
  }

  showWarning(msg: string) {
    Swal.fire({ toast: true, icon: 'warning', title: msg, timer: 2000, position: 'top-end', showConfirmButton: false });
  }
}
