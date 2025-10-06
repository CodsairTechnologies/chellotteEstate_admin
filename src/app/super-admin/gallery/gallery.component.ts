import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import Swal from 'sweetalert2';
import { ApiIntegrationService } from '../../../api-service/api-integration.service';
import { environment } from '../../../environments/environment';
import { TableComponent } from '../../common-table/table/table.component';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, TableComponent, ReactiveFormsModule, DialogModule, ButtonModule, TableModule, AvatarModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css'
})
export class GalleryComponent {
  token: any;
  adminid: any;
  userName: any;
  status: any;
  Loader: boolean = false;

  OpenModal = false;
  deleteModal = false;
  displaySingleViewModal = false;
  modalHeader = 'Add Gallery';

  arrList: any = [];
  arrColumns: any = [
    { strHeader: "Sl. No.", strAlign: "center", strKey: "slNo", field: "slNo" },
    { strHeader: "Image", strAlign: "center", strKey: "imageurl", field: "imageurl" },
    { strHeader: "Title", strAlign: "center", strKey: "title", field: "title" },
    { strHeader: "Status", strAlign: "center", strKey: "strStatus", field: "status" },
    { strHeader: "Actions", strAlign: "center", strKey: "strActions" }
  ];

  GalleryForm!: FormGroup;
  imagePreview: string | ArrayBuffer | null = '';
  showImageBox = false;
  fileType = '';
  id: any;
  selectedGallery: any;

  constructor(
    private fb: FormBuilder, private cdRef: ChangeDetectorRef,
    private apiService: ApiIntegrationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    this.token = localStorage.getItem("token");
    this.adminid = localStorage.getItem("loginId");
    this.userName = localStorage.getItem("username");
    this.status = localStorage.getItem("status");
    this.GalleryForm = this.fb.group({
      title: [''],
      image: [null, Validators.required]
    });
    this.getGalleryList();
  }

  getGalleryList() {
    this.Loader = true;
    this.apiService.handleApiCall('/api/admin/getGallery/', {}, (res) => {
      this.Loader = false;
      const galleries = res.data || [];

      if (res.response === 'Success' && galleries.length) {
        this.arrList = galleries.map((g: any, i: number) => ({
          ...g,
          slNo: i + 1,
          imageurl: g.image ? environment.apiUrl + g.image : 'assets/images/no-image.png', // 👈 match Hero logic
          strStatus: g.status || '--'
        }));
      } else {
        this.arrList = [];
        this.showWarning('No records found.');
      }
    });
  }


  openGalleryModal(isEdit: boolean, id?: string) {
    this.modalHeader = isEdit ? 'Edit Gallery' : 'Add Gallery';
    this.OpenModal = true;

    if (isEdit && id) {
      this.id = id;
      this.getGalleryById(id);
    } else {
      this.id = '';
      this.GalleryForm.reset();
    }
  }


  getGalleryById(id: string) {
    this.Loader = true;
    this.apiService.handleApiCall('/api/admin/getGallerybyid/', { id }, (res) => {
      this.Loader = false;

      if (res.response === 'Success' && res.data) {
        const gallery = res.data;

        // Patch form
        this.GalleryForm.patchValue({
          title: gallery.title || '',
          image: 'preloaded' // validator ok
        });

        // Set image preview
        if (gallery.image) {
          this.imagePreview = environment.apiUrl + gallery.image;
          this.showImageBox = true;
          this.fileType = 'image/png'; // <-- important, otherwise *ngIf fails
        } else {
          this.imagePreview = '';
          this.showImageBox = false;
          this.fileType = '';
        }

      } else {
        this.showError(res.message || 'Failed to fetch gallery details.');
      }
    });
  }


  handleGalleryOperation() {
    if (this.GalleryForm.invalid) {
      this.GalleryForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();

    // ✅ Include id only when editing
    if (this.id) {
      formData.append('id', this.id);
    }

    formData.append('title', this.GalleryForm.get('title')?.value || '');
    formData.append('createdId', this.adminid || '');

    const imageFile = this.GalleryForm.get('image')?.value;
    if (imageFile instanceof File) {
      formData.append('image', imageFile);
    }

    this.Loader = true;

    this.apiService.handleApiCall('/api/admin/add_edit_gallery/', formData, (res) => {
      // Stop loader immediately after getting a response
      this.Loader = false;

      if (res.response === 'Success') {
        this.showSuccess(res.message);
        this.OpenModal = false;
        this.getGalleryList();
      } else {
        console.log('API callback:', res);
        this.showError(res.message || 'Something went wrong.');
      }

      this.cdRef.detectChanges();
    });
  }




  deleteFn() {
    if (!this.id) {
      console.error('ID is missing');
      return;
    }
    this.apiService.handleApiCall('/api/admin/deleteGallery/', { id: this.id }, (res) => {
      if (res.response === 'Success') {
        this.showSuccess(res.message);
        this.deleteModal = false;
        this.getGalleryList();
      } else this.showError(res.message);
    });
  }

  toggleActiveInactive(id: string, status: string) {
    if (!id || !status) {
      this.showError('id and status are required');
      return;
    }

    this.apiService.handleApiCall('/api/admin/UpdateGalleryStatus/', { id, status }, (res) => {
      if (res.response === 'Success') {
        this.showSuccess(res.message);
        this.getGalleryList();
      } else {
        this.showError(res.message);
      }
    });
  }

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
        this.clearCard();
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.src = e.target.result;

        img.onload = () => {
          // ✅ If valid, show preview
          this.imagePreview = e.target.result;
          this.showImageBox = true;
          this.fileType = fileType;

          // Patch file to form
          this.GalleryForm.patchValue({ image: file });
          this.GalleryForm.get('image')?.updateValueAndValidity();
        };
      };

      reader.readAsDataURL(file);
    }
  }


  clearCard() {
    this.imagePreview = null;
    this.showImageBox = false;
    this.GalleryForm.patchValue({ image: null });
  }

  eventFromTable(event: any) {
    switch (event.strOperation) {
      case 'EDIT_DATA':
        this.id = event.objElement.id;
        this.openGalleryModal(true, this.id);
        break;
      case 'DELETE_DATA':
        this.id = event.objElement.id;
        this.deleteModal = true;
        break;
      case 'SINGLEVIEW_DATA':
        this.selectedGallery = event.objElement;
        this.displaySingleViewModal = true;
        break;
      case 'TOGGLETABLE_DATA':
        const newStatus = event.objElement.status;
        this.toggleActiveInactive(event.objElement.id, newStatus);
        break;

      default:
        break;
    }
  }

  getImageUrl(path: string): string {
    return `${environment.apiUrl}/${path}`;
  }

  showSuccess(msg: string) {
    Swal.fire({ icon: 'success', title: msg, toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
  }
  showError(msg: string) {
    Swal.fire({ icon: 'error', title: msg, toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
  }
  showWarning(msg: string) {
    Swal.fire({ icon: 'warning', title: msg, toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
  }
}
