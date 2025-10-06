import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import Swal from 'sweetalert2';
import { ApiIntegrationService } from '../../../api-service/api-integration.service';
import { environment } from '../../../environments/environment';
import { TableComponent } from '../../common-table/table/table.component';

@Component({
  selector: 'app-tourism',
  standalone: true,
  imports: [TableComponent, ButtonModule, DialogModule, TableModule, ReactiveFormsModule, CommonModule],
  templateUrl: './tourism.component.html',
  styleUrl: './tourism.component.css'
})
export class TourismComponent {
  token: any; adminid: any; Loader: boolean = false;
  OpenModal: boolean = false;
  deleteModal: boolean = false;
  displaySingleViewModal: boolean = false;
  blnHasSingleview: boolean = true;
  blnForDelete: boolean = true;
  blnNoEdit: boolean = true;

  TourismForm!: FormGroup;
  imagePreview: string | ArrayBuffer | null = '';
  showImageBox: boolean = false;
  fileType: string = '';

  arrList: any = [];
  arrColumns: any = [
    { strHeader: "Sl. No.", strAlign: "center", strKey: "slNo", field: "slNo" },
    { strHeader: "Image", strAlign: "center", strKey: "image", field: "image" },
    { strHeader: "Title", strAlign: "center", strKey: "card_title", field: "card_title" },
    { strHeader: "Description", strAlign: "center", strKey: "card_description", field: "card_description" },
    { strHeader: "Actions", strAlign: "center", strKey: "strActions" }
  ];

  selectedCard: any = null;
  id: any;
  modalHeader: string = 'Add Tourism Card';

  constructor(private formBuilder: FormBuilder, private objApiService: ApiIntegrationService, @Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.token = localStorage.getItem("token");
      this.adminid = localStorage.getItem("loginId");
    }

    this.TourismForm = this.formBuilder.group({
      card_title: ['', [Validators.maxLength(80)]],
      card_description: ['', [Validators.maxLength(150)]],
      card_image: [null, this.imageRequiredValidator]
    });

    this.getTableFn();
  }

  imageRequiredValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value instanceof File || control.value === 'preloaded') return null;
    return { required: true };
  }

  // Fetch tourism cards
  getTableFn() {
    this.objApiService.handleApiCall('/api/admin/GetTourismCards/', {}, (res) => {
      console.log('API raw response:', res);
      if (res.response === 'Success' && res.cards?.length) {
        this.arrList = res.cards.map((obj: any, i: number) => ({
          ...obj,
          slNo: i + 1,
          image: obj.card_image ? environment.apiUrl + obj.card_image : 'assets/images/no-image.png',
        }));
      } else this.arrList = [];
    });
  }



  openCardModal(isEdit: boolean, id?: any) {
    this.OpenModal = true;
    this.modalHeader = isEdit ? 'Edit Tourism Card' : 'Add Tourism Card';

    this.TourismForm.reset();
    this.showImageBox = false;
    this.imagePreview = null;

    if (isEdit && id) {
      this.id = id;
      this.getCardById(id);
    } else {
      this.id = ''; 
    }
  }



  getCardById(id: string) {
    this.objApiService.handleApiCall('/api/admin/GetTourismCardByID/', { id }, (res) => {
      if (res.response === 'Success' && res.data) {
        this.id = id;
        const card = res.data;

        this.TourismForm.patchValue({
          card_title: card.card_title,
          card_description: card.card_description,
          card_image: 'preloaded'
        });

        this.imagePreview = environment.apiUrl + card.card_image;
        this.showImageBox = true;
      }
    });
  }


  handleCardOperation() {
    if (this.TourismForm.invalid) { this.TourismForm.markAllAsTouched(); return; }

    const formData = new FormData();
    formData.append('card_title', this.TourismForm.get('card_title')?.value || '');
    formData.append('card_description', this.TourismForm.get('card_description')?.value || '');
    formData.append('createdId', this.adminid);
    if (this.id) formData.append('id', this.id);

    const imageFile = this.TourismForm.get('card_image')?.value;
    if (imageFile instanceof File) formData.append('card_image', imageFile);

    this.Loader = true;
    this.objApiService.handleApiCall('/api/admin/AddEditTourismCard/', formData, (res) => {
      this.Loader = false;
      if (res.response === 'Success') {
        this.showSuccess(res.message);
        this.TourismForm.reset(); this.imagePreview = null; this.showImageBox = false; this.OpenModal = false;
        this.getTableFn();
      } else this.showError(res.message || 'Something went wrong.');
    });
  }

  onFileUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { this.showWarning('Please upload a valid image.'); return; }
    if (file.size > 5 * 1024 * 1024) { this.showWarning('File must be <5MB.'); return; }

    const reader = new FileReader();
    reader.onload = (e: any) => { this.imagePreview = e.target.result; this.showImageBox = true; this.fileType = file.type; };
    reader.readAsDataURL(file);
    this.TourismForm.patchValue({ card_image: file });
    this.TourismForm.get('card_image')?.updateValueAndValidity();
  }

  clearCard() { this.imagePreview = null; this.showImageBox = false; this.fileType = ''; this.TourismForm.patchValue({ card_image: null }); }

  getImageUrl(path: string) { return `${environment.apiUrl}/${path}`; }

  deleteFn() {
    if (!this.id) return;
    this.objApiService.handleApiCall('/api/admin/DeleteTourismCard/', { id: this.id }, (res) => {
      if (res.response === 'Success') { this.showSuccess(res.message); this.getTableFn(); this.deleteModal = false; }
      else this.showError(res.message);
    });
  }

  eventFromTable(objEvent: any) {
    switch (objEvent.strOperation) {
      case 'EDIT_DATA': this.openCardModal(true, objEvent.objElement.id); break;
      case 'DELETE_DATA': this.id = objEvent.objElement.id; this.deleteModal = true; break;
      case 'SINGLEVIEW_DATA': this.selectedCard = objEvent.objElement; this.displaySingleViewModal = true; break;
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
