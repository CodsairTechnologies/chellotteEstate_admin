import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import Swal from 'sweetalert2';
import { ApiIntegrationService } from '../../../api-service/api-integration.service';
import { environment } from '../../../environments/environment';
import { TableComponent } from '../../common-table/table/table.component';

@Component({
  selector: 'app-plantation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, TableComponent],
  templateUrl: './plantation.component.html',
  styleUrl: './plantation.component.css'
})
export class PlantationComponent {
  token: any;
  adminid: any;
  Loader = false;

  openModal = false;
  deleteModal = false;
  displaySingleViewModal = false;
  modalHeader = 'Add Plantation';

  arrList: any[] = [];
  arrColumns = [
    { strHeader: "Sl. No.", strAlign: "center", strKey: "slNo" },
    { strHeader: "Title", strAlign: "center", strKey: "title" },
    { strHeader: "Description", strAlign: "center", strKey: "description" },
    { strHeader: "Image 1", strAlign: "center", strKey: "image_left" },
    { strHeader: "Image 2", strAlign: "center", strKey: "image_right" },
    { strHeader: "Status", strAlign: "center", strKey: "strStatus" },
    { strHeader: "Actions", strAlign: "center", strKey: "strActions" }
  ];

  blnHasSingleview = true;
  blnForDelete = true;
  blnNoEdit = true;

  PlantationForm!: FormGroup;
  image1Preview: string | null = null;
  image2Preview: string | null = null;
  showImage1 = false;
  showImage2 = false;
  ID: any;
  selectedPlantation: any = null;

  constructor(
    private fb: FormBuilder,
    private objApiService: ApiIntegrationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.token = localStorage.getItem('token');
      this.adminid = localStorage.getItem('loginId');
    }

    this.PlantationForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      image1: [null, Validators.required],
      image2: [null, Validators.required]
    });

    this.getPlantations();
  }

  getImageUrl(path: string | null | undefined): string {
    if (!path) return 'assets/images/no-image.png';
    return path.startsWith('http') ? path : `${environment.apiUrl.replace(/\/$/, '')}/${path}`;
  }


  getPlantations() {
    this.Loader = true;
    this.objApiService.handleApiCall('/api/admin/GetHomePlantations/', {}, (res) => {
      this.Loader = false;

      if (res.response === 'Success' && res.Plantation?.length) {
        this.arrList = res.Plantation.map((item: any, i: number) => ({
          ...item,
          slNo: i + 1,
          image_left: item.image1 ? environment.apiUrl + item.image1 : 'assets/images/no-image.png', // map to 'image_left'
          image_right: item.image2 ? environment.apiUrl + item.image2 : 'assets/images/no-image.png', // map to 'image_right'
          strStatus: item.status
        }));
      } else {
        this.arrList = [];
        this.showWarning('No plantation records found.');
      }
    });
  }



  openPlantationModal(isEdit: boolean, id?: string) {
    this.modalHeader = isEdit ? 'Edit Plantation' : 'Add Plantation';
    this.openModal = true;

    if (isEdit && id) {
      this.ID = id;
      this.getPlantationById(id);
    } else {
      this.PlantationForm.reset();
      this.image1Preview = null;
      this.image2Preview = null;
      this.showImage1 = false;
      this.showImage2 = false;
      this.ID = '';
    }
  }


  getPlantationById(id: string) {
    this.Loader = true;
    this.objApiService.handleApiCall('/api/admin/GetHomePlantationByID/', { id }, (res) => {
      this.Loader = false;

      if (res.response === 'Success' && res.data) {
        const p = res.data;
        this.PlantationForm.patchValue({
          title: p.title,
          description: p.description,
          image1: 'preloaded',
          image2: 'preloaded'
        });

        this.image1Preview = p.image1 ? environment.apiUrl + p.image1 : 'assets/images/no-image.png';
        this.image2Preview = p.image2 ? environment.apiUrl + p.image2 : 'assets/images/no-image.png';
        this.showImage1 = !!p.image1;
        this.showImage2 = !!p.image2;
      } else {
        this.showWarning('Unable to fetch plantation details.');
      }
    });
  }

  handlePlantationOperation() {
    if (this.PlantationForm.invalid) {
      this.PlantationForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    if (this.ID) formData.append('id', this.ID);
    formData.append('title', this.PlantationForm.get('title')?.value);
    formData.append('description', this.PlantationForm.get('description')?.value);
    formData.append('createdId', this.adminid);

    const img1 = this.PlantationForm.get('image1')?.value;
    const img2 = this.PlantationForm.get('image2')?.value;
    if (img1 instanceof File) formData.append('image1', img1);
    if (img2 instanceof File) formData.append('image2', img2);

    this.Loader = true;
    this.objApiService.handleApiCall('/api/admin/AddEditPlantation/', formData, (res) => {
      this.Loader = false;
      if (res.response === 'Success') {
        this.showSuccess(res.message || 'Operation successful.');
        this.openModal = false;
        this.getPlantations();
      } else {
        this.showError(res.message || 'Operation failed.');
      }
    });
  }

  onFileUpload(event: any, type: 'image1' | 'image2') {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.showWarning('Please upload a valid image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'image1') {
        this.image1Preview = e.target?.result as string;
        this.showImage1 = true;
        this.PlantationForm.patchValue({ image1: file });
      } else {
        this.image2Preview = e.target?.result as string;
        this.showImage2 = true;
        this.PlantationForm.patchValue({ image2: file });
      }
    };
    reader.readAsDataURL(file);
  }

  clearImage(type: 'image1' | 'image2') {
    if (type === 'image1') {
      this.image1Preview = null;
      this.showImage1 = false;
      this.PlantationForm.patchValue({ image1: null });
    } else {
      this.image2Preview = null;
      this.showImage2 = false;
      this.PlantationForm.patchValue({ image2: null });
    }
  }

  deleteFn() {
    this.Loader = true;
    this.objApiService.handleApiCall('/api/admin/DeleteHomePlantation/', { id: this.ID }, (res) => {
      this.Loader = false;
      if (res.response === 'Success') {
        this.showSuccess(res.message || 'Deleted successfully.');
        this.getPlantations();
        this.deleteModal = false;
      } else {
        this.showError(res.message || 'Deletion failed.');
      }
    });
  }

  toggleActiveInactive(id: number, status: string) {
    this.Loader = true;
    this.objApiService.handleApiCall('/api/admin/UpdateHomePlantationStatus/', { id, status }, (res) => {
      this.Loader = false;
      if (res.response === 'Success') {
        this.showSuccess(res.message || 'Status updated.');
      } else {
        this.showError(res.message || 'Failed to update status.');
      }
      this.getPlantations();
    });
  }

  eventFromTable(event: any) {
    switch (event.strOperation) {
      case 'EDIT_DATA':
        this.openPlantationModal(true, event.objElement.id);
        break;
      case 'DELETE_DATA':
        this.ID = event.objElement.id;
        this.deleteModal = true;
        break;
      case 'SINGLEVIEW_DATA':
        this.selectedPlantation = event.objElement;
        this.displaySingleViewModal = true;
        break;
      case 'TOGGLETABLE_DATA':
        this.toggleActiveInactive(event.objElement.id, event.objElement.status);
        break;
    }
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
