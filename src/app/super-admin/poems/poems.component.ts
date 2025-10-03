import { Component } from '@angular/core';
import { TableComponent } from '../../common-table/table/table.component';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
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
  selector: 'app-poems',
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
    CommonModule],
  templateUrl: './poems.component.html',
  styleUrl: './poems.component.css'
})
export class PoemsComponent {
  token: any;
  adminid: any;
  userName: any;
  status: any;
  Loader: boolean = false;

  ID: any;
  categorylist: any = [];
  CountryByIdList: any = [];
  adddialogvisible: boolean = false;
  Delete_countryID: any;

  PoemForm !: FormGroup;
  imagePreview: string | ArrayBuffer | null = '';
  showImageBox: boolean = false;

  id: any;
  coverPreview: string | null = null;
  coverFileType: string = '';
  showCoverBox = false;
  storyImgPreview: string | null = null;
  storyFileType: string = '';
  showStoryImgBox = false;
  authorImgPreview: string | ArrayBuffer | null = null;
  showAuthorImgBox: boolean = false;
  authorFileType: string = '';
  isEditMode: boolean = false;
  fileType: string = '';
  showBannerImgBox: boolean = false;
  bannerPreview: string = '';
  bannerFileType: string = '';


  constructor(private formbuilder: FormBuilder, private http: HttpClient, private router: Router, private objApiService: ApiIntegrationService, private route: ActivatedRoute) { }

  ngOnInit(): void {

    this.token = localStorage.getItem("token");
    this.adminid = localStorage.getItem("loginId");
    this.userName = localStorage.getItem("username");
    this.status = localStorage.getItem("status");

    this.PoemForm = this.formbuilder.group({
      bannerTitle: [''],
      bannerImage: [null, Validators.required],
      authorName: ['', Validators.required],
      designation: [''],
      aboutAuthor: [''],
      authorImage: [null],
      poemTitle: ['', Validators.required],
      poemContent: ['', Validators.required],
      // storyImage: [null, Validators.required],

    });

    this.route.queryParams.subscribe((params) => {
      const id = params['id'];
      this.isEditMode = !!(id);
      if (id) {
        this.getPoemById(id);
      }
    });

  }


onBannerUpload(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  const fileType = file.type;

  // ✅ Only allow images
  if (!fileType.startsWith('image/')) {
    this.showWarning('Please upload a valid image.');
    return;
  }

  // ✅ File size validation (5 MB limit)
  const maxSizeInMB = 5;
  if (file.size > maxSizeInMB * 1024 * 1024) {
    this.showWarning(`File size must be less than ${maxSizeInMB} MB.`);
    return;
  }

  const reader = new FileReader();
  reader.onload = (e: any) => {
    const img = new Image();
    img.src = e.target.result;

    img.onload = () => {
      const width = img.width;
      const height = img.height;

      // ✅ Minimum resolution check (optional, e.g., 1280x480)
      if (width < 1280 || height < 480) {
        this.showWarning('Banner image must be at least 1280 × 480 pixels.');
        return;
      }

      // ✅ Optional: Aspect ratio check (e.g., 16:6)
      const aspectRatio = width / height;
      const expectedRatio = 16 / 6;
      const tolerance = 0.05;
      if (Math.abs(aspectRatio - expectedRatio) > tolerance) {
        this.showWarning('Banner image must have a 16:6 aspect ratio.');
        return;
      }

      // ✅ If valid → preview + form patch
      this.bannerPreview = e.target.result;
      this.bannerFileType = fileType;
      this.showBannerImgBox = true;

      this.PoemForm.patchValue({ bannerImage: file });
      this.PoemForm.get('bannerImage')?.updateValueAndValidity();
    };
  };

  reader.readAsDataURL(file);
}


  clearBannerImage() {
    this.bannerPreview = '';
    this.showBannerImgBox = false;
    this.bannerFileType = '';
    this.PoemForm.get('bannerImage')?.setValue(null);
    this.PoemForm.get('bannerImage')?.markAsTouched();
  }


  // Function to get category details by ID (Edit Mode)
  getPoemById(id: string) {
    this.ID = id;
    this.Loader = true;

    this.objApiService.handleApiCall('/api/admin/getpoemsbyid/', { id: this.ID }, (response) => {
      this.Loader = false;

      if (response['response'] === 'Success' && response['poem']) {
        const poem = response['poem'];

        this.PoemForm.patchValue({
          bannerTitle: poem.bannertitle || '',
          authorName: poem.reviewername || '',
          designation: poem.reviewerjob || '',
          aboutAuthor: poem.aboutreviewer || '',
          poemTitle: poem.booktitle || '',
          poemContent: poem.content || '',
          // storyImage: null
        });


        const baseUrl = environment.apiUrl;

        // Load and preview banner image
        if (poem.bannerimage) {
          this.bannerPreview = baseUrl + poem.bannerimage;
          this.showBannerImgBox = true;
          this.bannerFileType = 'image/png';

          // ✅ Set dummy value to mark it as "valid"
          this.PoemForm.get('bannerImage')?.setValue(true);
        }


        if (poem.reviewerimage) {
          this.authorImgPreview = baseUrl + poem.reviewerimage;
          this.showAuthorImgBox = true;
          this.authorFileType = 'image/png';

          this.PoemForm.get('authorImage')?.setValue(true);
        }

        // if (poem.bookcoverimage) {
        //   this.storyImgPreview = baseUrl + poem.bookcoverimage;
        //   this.showStoryImgBox = true;
        //   this.storyFileType = 'image/png';

        //   this.PoemForm.get('storyImage')?.setValue(true);
        // }


        // 🔁 Conditionally apply validators
        if (!this.ID) {
          // this.PoemForm.get('authorImage')?.setValidators(Validators.required);
          this.PoemForm.get('bannerImage')?.setValidators(Validators.required);
          // this.PoemForm.get('storyImage')?.setValidators(Validators.required);

        } else {
          // this.PoemForm.get('authorImage')?.clearValidators();
          this.PoemForm.get('bannerImage')?.clearValidators();
          // this.PoemForm.get('storyImage')?.clearValidators();

        }

        // this.PoemForm.get('authorImage')?.updateValueAndValidity();
        this.PoemForm.get('coverImage')?.updateValueAndValidity();
        // this.PoemForm.get('storyImage')?.updateValueAndValidity();


      } else {
        this.showError(response.message || 'Failed to fetch poem details.');
      }
    });
  }


  onCoverUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.PoemForm.patchValue({ coverImage: file });
      this.coverPreview = URL.createObjectURL(file);
      this.coverFileType = file.type;
      this.showCoverBox = true;
    }
  }

  clearCoverImage() {
    this.PoemForm.patchValue({ coverImage: null });
    this.coverPreview = null;
    this.showCoverBox = false;
  }



  // onStoryImageUpload(event: any) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     this.storyImgPreview = URL.createObjectURL(file);
  //     this.showStoryImgBox = true;
  //     this.storyFileType = file.type;
  //     this.PoemForm.patchValue({ storyImage: file });
  //   }
  // }

  // clearStoryImage() {
  //   this.PoemForm.patchValue({ storyImage: null });
  //   this.storyImgPreview = null;
  //   this.showStoryImgBox = false;
  //   this.storyFileType = '';
  // }




isAuthorDragOver = false;


// Handle file selection via click
onAuthorImageUpload(event: Event) {
  const file = (event.target as HTMLInputElement)?.files?.[0];
  if (file) {
    this.previewAuthorImage(file);
  }
}

// Drag & drop events
onAuthorDragOver(event: DragEvent) {
  event.preventDefault();
  this.isAuthorDragOver = true;
}

onAuthorDragLeave(event: DragEvent) {
  event.preventDefault();
  this.isAuthorDragOver = false;
}

onAuthorFileDrop(event: DragEvent) {
  event.preventDefault();
  this.isAuthorDragOver = false;
  const file = event.dataTransfer?.files?.[0];
  if (file) {
    this.previewAuthorImage(file);
  }
}

// Preview the image
previewAuthorImage(file: File) {
  this.authorFileType = file.type;
  const reader = new FileReader();
  reader.onload = () => {
    this.authorImgPreview = reader.result;
    this.showAuthorImgBox = true;
  };
  reader.readAsDataURL(file);
  this.PoemForm.patchValue({ authorImage: file });
  this.PoemForm.get('authorImage')?.updateValueAndValidity();
}

// Clear image
clearAuthorImage() {
  this.authorImgPreview = null;
  this.showAuthorImgBox = false;
  this.PoemForm.patchValue({ authorImage: null });
}




  // Function to handle Add/Edit operation
  handlePoemSubmit() {
    if (this.PoemForm.invalid) {
      this.PoemForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('bannertitle', this.PoemForm.get('bannerTitle')?.value);
    formData.append('reviewername', this.PoemForm.get('authorName')?.value);
    formData.append('reviewerjob', this.PoemForm.get('designation')?.value);
    formData.append('aboutreviewer', this.PoemForm.get('aboutAuthor')?.value);
    formData.append('booktitle', this.PoemForm.get('poemTitle')?.value);
    formData.append('content', this.PoemForm.get('poemContent')?.value);
    formData.append('createdId', this.adminid);

    const bannerImage = this.PoemForm.get('bannerImage')?.value;
    if (bannerImage instanceof File) {
      formData.append('bannerimage', bannerImage);
    }

    const authorImage = this.PoemForm.get('authorImage')?.value;
    if (authorImage instanceof File) {
      formData.append('reviewerimage', authorImage);
    }

    // const storyImage = this.PoemForm.get('storyImage')?.value;
    // if (storyImage instanceof File) {
    //   formData.append('bookcoverimage', storyImage);
    // }

    if (this.ID) {
      formData.append('poem_id', this.ID);
    }

    this.Loader = true;

    this.objApiService.handleApiCall('/api/admin/addeditpoems/', formData, (response) => {
      this.Loader = false;
      if (response['response'] === 'Success') {
        this.showSuccess(response.message);
        this.PoemForm.reset();
                this.router.navigateByUrl('/super-admin/listpoems')

        this.clearImagePreviews();
      } else {
        this.showError(response.message || 'Something went wrong.');
      }
    });
  }


  clearImagePreviews() {
    this.authorImgPreview = null;
    this.coverPreview = null;
    this.storyImgPreview = null;
    this.showAuthorImgBox = false;
    this.showCoverBox = false;
    this.showStoryImgBox = false;
  }


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
      this.PoemForm.patchValue({ image: file });
      this.PoemForm.get('image')?.updateValueAndValidity();
    }
  }



  // Function to clear image preview
  clearCard() {
    this.imagePreview = null;
    this.showImageBox = false;
    this.PoemForm.patchValue({ image: null });
    this.PoemForm.get('image')?.updateValueAndValidity();
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
