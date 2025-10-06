import { CommonModule } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import Swal from 'sweetalert2';
import { ApiIntegrationService } from '../../../api-service/api-integration.service';
import { environment } from '../../../environments/environment';
import { TableComponent } from '../../common-table/table/table.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, TableComponent, ReactiveFormsModule, DialogModule, ButtonModule, TableModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  token: any;
  adminid: any;
  Loader = false;

  OpenModal = false;
  deleteModal = false;
  displaySingleViewModal = false;
  modalHeader = 'Add Product';

  arrList: any = [];
  arrColumns: any = [
    { strHeader: "Sl. No.", strAlign: "center", strKey: "slNo", field: "slNo" },
    { strHeader: "Title", strAlign: "center", strKey: "title", field: "title" },
    { strHeader: "Price", strAlign: "center", strKey: "price", field: "price" },
    { strHeader: "Availability", strAlign: "center", strKey: "availability", field: "availability" },
    { strHeader: "Status", strAlign: "center", strKey: "strStatus", field: "status" },
    { strHeader: "Actions", strAlign: "center", strKey: "strActions" }
  ];

  ProductForm!: FormGroup;
  id: any;
  selectedProduct: any;
  // imagePreview: any = { cover_image: '', background_image: '', card_icon: '' };
  imageFiles: any = {};

  constructor(
    private fb: FormBuilder,
    private apiService: ApiIntegrationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    this.token = localStorage.getItem("token");
    this.adminid = localStorage.getItem("loginId");

    this.ProductForm = this.fb.group({
      productID: [''],
      title: ['', Validators.required],
      description: [''],
      price: ['', Validators.required],
      availability: ['', Validators.required], // empty to show placeholder
      brand_name: [''],
      is_featured: [false],
      cover_image: [null],
      background_image: [null],
      card_icon: [null],
    });

    this.getProductList();
  }

  // get function

  getProductList() {
    this.Loader = true;
    this.apiService.handleApiCall('/api/admin/GetProducts/', {}, (res) => {
      this.Loader = false;
      const products = res.data || [];

      if (res.response === 'Success') {
        this.arrList = products.map((p: any, i: number) => ({
          ...p,
          slNo: i + 1,
        }));
      } else {
        this.arrList = [];
        this.showWarning('No products found.');
      }
    });
  }

  // ==============================

  openProductModal(isEdit: boolean, id?: string) {
    this.modalHeader = isEdit ? 'Edit Product' : 'Add Product';
    this.OpenModal = true;

    if (isEdit && id) {
      this.id = id;
      this.getProductById(id);
    } else {
      this.id = '';
      this.ProductForm.reset({ availability: 'instock', is_featured: false });
      this.imagePreview = { cover_image: '', background_image: '', card_icon: '' };
      this.imageFiles = {};
    }
  }

  imagePreview: any = { cover_image: '', background_image: '', card_icon: '' };
  showImageBox: any = { cover_image: false, background_image: false, card_icon: false };
  fileType: any = { cover_image: '', background_image: '', card_icon: '' };

  // byid function
  getProductById(id: string) {
    this.Loader = true;
    this.apiService.handleApiCall('/api/admin/GetProductByID/', { id }, (res) => {
      this.Loader = false;
      if (res.response === 'Success' && res.data) {
        const product = res.data;

        // Patch fields
        this.ProductForm.patchValue({
          productID: product.productID || '',
          title: product.title || '',
          description: product.description || '',
          price: product.price || '',
          availability: (product.availability || 'instock').toLowerCase().replace(/\s/g, ''),
          brand_name: product.brand_name || '',
          is_featured: !!product.is_featured,
          cover_image: product.cover_image ? 'preloaded' : null,
          background_image: product.background_image ? 'preloaded' : null,
          card_icon: product.card_icon ? 'preloaded' : null
        });

        // Handle image previews


        // Patch fields in edit modal
        ['cover_image', 'background_image', 'card_icon'].forEach(key => {
          if (product[key]) {
            this.imagePreview[key] = this.getImageUrl(product[key]); // always use getImageUrl
            this.showImageBox[key] = true;
            this.fileType[key] = 'image/png';
          } else {
            this.imagePreview[key] = '';
            this.showImageBox[key] = false;
            this.fileType[key] = '';
          }
        });


      } else {
        this.showError(res.message || 'Failed to fetch product details.');
      }
    });
  }

  // =======================

  clearImage(key: string) {
    this.showImageBox[key] = false;
    this.imagePreview[key] = '';
    this.fileType[key] = '';
    this.ProductForm.get(key)?.setValue(null);
  }

  onFileUpload(event: any, key: string) {
    const file = event.target.files[0];
    if (file) {
      this.imageFiles[key] = file;
      this.showImageBox[key] = true;
      this.fileType[key] = file.type;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview[key] = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // add edit

  handleProductOperation() {
    if (this.ProductForm.invalid) {
      this.ProductForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    if (this.id) formData.append('id', this.id);

    Object.keys(this.ProductForm.controls).forEach(key => {
      const value = this.ProductForm.get(key)?.value;
      if (key in this.imageFiles && this.imageFiles[key]) {
        formData.append(key, this.imageFiles[key]);
      } else {
        formData.append(key, value ?? '');
      }
    });

    formData.append('createdId', this.adminid || '');

    this.Loader = true;
    this.apiService.handleApiCall('/api/admin/AddEditProduct/', formData, (res) => {
      this.Loader = false;
      if (res.response === 'Success') {
        this.showSuccess(res.message);
        this.OpenModal = false;
        this.getProductList();
      } else {
        this.showError(res.message);
      }
    });
  }

  // ============================

  // delete

  deleteFn() {
    if (!this.id) return;
    this.apiService.handleApiCall('/api/admin/DeleteProduct/', { id: this.id }, (res) => {
      if (res.response === 'Success') {
        this.showSuccess(res.message);
        this.deleteModal = false;
        this.getProductList();
      } else this.showError(res.message);
    });
  }

  // ==============

  // status

  toggleActiveInactive(id: string, status: string) {
    this.apiService.handleApiCall('/api/admin/UpdateProductStatus/', { id, status }, (res) => {
      if (res.response === 'Success') {
        this.showSuccess(res.message);
        this.getProductList();
      } else {
        this.showError(res.message);
      }
    });
  }

  // ==================

  // Always normalize image URLs
  getImageUrl(path: string): string {
    if (!path) return '';
    // If already a URL, use as-is
    if (path.startsWith('http')) return path;
    // Otherwise, prepend API URL
    return `${environment.apiUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  }



  // onFileUpload(event: any, field: string) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     this.imageFiles[field] = file;
  //     const reader = new FileReader();
  //     reader.onload = (e: any) => {
  //       this.imagePreview[field] = e.target.result;
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }

  eventFromTable(event: any) {
    switch (event.strOperation) {
      case 'EDIT_DATA':
        this.id = event.objElement.id;
        this.openProductModal(true, this.id);
        break;
      case 'DELETE_DATA':
        this.id = event.objElement.id;
        this.deleteModal = true;
        break;
      case 'SINGLEVIEW_DATA':
        this.selectedProduct = event.objElement;
        this.displaySingleViewModal = true;
        break;
      case 'TOGGLETABLE_DATA':
        this.toggleActiveInactive(event.objElement.id, event.objElement.status);
        break;
      default:
        break;
    }
  }

  showSuccess(msg: string) { Swal.fire({ icon: 'success', title: msg, toast: true, position: 'top-end', timer: 3000, showConfirmButton: false }); }
  showError(msg: string) { Swal.fire({ icon: 'error', title: msg, toast: true, position: 'top-end', timer: 3000, showConfirmButton: false }); }
  showWarning(msg: string) { Swal.fire({ icon: 'warning', title: msg, toast: true, position: 'top-end', timer: 3000, showConfirmButton: false }); }
}
