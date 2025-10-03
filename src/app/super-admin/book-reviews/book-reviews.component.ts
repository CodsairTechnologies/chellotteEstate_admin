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
  selector: 'app-book-reviews',
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
    CommonModule], templateUrl: './book-reviews.component.html',
  styleUrl: './book-reviews.component.css'
})
export class BookReviewsComponent {
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

  BookReviewsForm !: FormGroup;
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



  constructor(private formbuilder: FormBuilder, private http: HttpClient, private router: Router, private objApiService: ApiIntegrationService, private route: ActivatedRoute) { }

  ngOnInit(): void {

    this.token = localStorage.getItem("token");
    this.adminid = localStorage.getItem("loginId");
    this.userName = localStorage.getItem("username");
    this.status = localStorage.getItem("status");

    this.BookReviewsForm = this.formbuilder.group({
      authorName: ['', Validators.required],
      designation: [''],
      aboutAuthor: [''],
      authorImage: [null],
      storyTitle: ['', Validators.required],
      storyContent: ['', Validators.required],
      coverImage: [null, Validators.required],
      storyImage: [null, Validators.required],
      bookRating: [1]
    });



    this.route.queryParams.subscribe((params) => {
      const id = params['id'];
      this.isEditMode = !!(id);
      if (id) {
        this.getBookReviewById(id);
      }
    });

  }



  // Function to get category details by ID (Edit Mode)
  getBookReviewById(id: string) {
    this.ID = id;
    this.Loader = true;

    this.objApiService.handleApiCall('/api/admin/getbookreviewbyid/', { id: this.ID }, (response) => {
      this.Loader = false;

      if (response['response'] === 'Success' && response['review']) {
        const review = response['review'];

        this.BookReviewsForm.patchValue({
          authorName: review.reviewername || '',
          designation: review.reviewerjob || '',
          aboutAuthor: review.aboutreviewer || '',
          storyTitle: review.booktitle || '',
          storyContent: review.content || '',
          bookRating: review.rating || 0,
          authorImage: null, // File will be updated only if changed
          coverImage: null,
          storyImage: null
        });

        const baseUrl = environment.apiUrl;

        if (review.reviewerimage) {
          this.authorImgPreview = baseUrl + review.reviewerimage;
          this.showAuthorImgBox = true;
          this.authorFileType = 'image/png';
        }

        if (review.bookbannerimage) {
          this.coverPreview = baseUrl + review.bookbannerimage;
          this.showCoverBox = true;
          this.coverFileType = 'image/png';
        }

        if (review.bookcoverimage) {
          this.storyImgPreview = baseUrl + review.bookcoverimage;
          this.showStoryImgBox = true;
          this.storyFileType = 'image/png';
        }

        // 🔁 Conditionally apply validators
        if (!this.ID) {
          // this.BookReviewsForm.get('authorImage')?.setValidators(Validators.required);
          this.BookReviewsForm.get('coverImage')?.setValidators(Validators.required);
          this.BookReviewsForm.get('storyImage')?.setValidators(Validators.required);

        } else {
          // this.BookReviewsForm.get('authorImage')?.clearValidators();
          this.BookReviewsForm.get('coverImage')?.clearValidators();
          this.BookReviewsForm.get('storyImage')?.clearValidators();

        }

        // this.BookReviewsForm.get('authorImage')?.updateValueAndValidity();
        this.BookReviewsForm.get('coverImage')?.updateValueAndValidity();
        this.BookReviewsForm.get('storyImage')?.updateValueAndValidity();


      } else {
        this.showError(response.message || 'Failed to fetch review details.');
      }
    });
  }




  onCoverUpload(event: any) {
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

        // ✅ Minimum resolution check
        if (width < 1280 || height < 480) {
          this.showWarning('Cover image must be at least 1280 × 480 pixels.');
          return;
        }

        // ✅ Aspect ratio check (16:6 ≈ 2.66)
        const aspectRatio = width / height;
        const expectedRatio = 16 / 6;
        if (Math.abs(aspectRatio - expectedRatio) > 0.01) {
          this.showWarning('Cover image must have a 16:6 aspect ratio.');
          return;
        }

        // ✅ If valid → preview + form patch
        this.coverPreview = e.target.result;
        this.coverFileType = fileType;
        this.showCoverBox = true;

        this.BookReviewsForm.patchValue({ coverImage: file });
        this.BookReviewsForm.get('coverImage')?.updateValueAndValidity();
      };
    };

    reader.readAsDataURL(file);
  }


  clearCoverImage() {
    this.BookReviewsForm.patchValue({ coverImage: null });
    this.coverPreview = null;
    this.showCoverBox = false;
  }


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
  this.BookReviewsForm.patchValue({ authorImage: file });
  this.BookReviewsForm.get('authorImage')?.updateValueAndValidity();
}

// Clear image
clearAuthorImage() {
  this.authorImgPreview = null;
  this.showAuthorImgBox = false;
  this.BookReviewsForm.patchValue({ authorImage: null });
}


onStoryImageUpload(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  // ✅ Allow only JPG/PNG
  const validTypes = ['image/jpeg', 'image/png'];
  if (!validTypes.includes(file.type)) {
    this.showWarning("Please upload a valid image file (JPG or PNG).");
    return;
  }

  // ✅ Max file size: 5MB
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    this.showWarning("File size must be less than 5MB.");
    return;
  }

  // ✅ Dimension check (min 300×450 px, 2:3 aspect ratio)
  const img = new Image();
  img.onload = () => {
    if (img.width < 300 || img.height < 450) {
      this.showWarning("Image must be at least 300×450px.");
      return;
    }

    if (img.height <= img.width) {
      this.showWarning("Image must be portrait (taller than wide).");
      return;
    }

    const aspectRatio = img.width / img.height;
    if (Math.abs(aspectRatio - (2 / 3)) > 0.05) {
      this.showWarning("Image must follow a 2:3 aspect ratio (e.g., 300×450px).");
      return;
    }

    // ✅ Passed → show preview
    this.storyImgPreview = URL.createObjectURL(file);
    this.showStoryImgBox = true;
    this.storyFileType = file.type;
    this.BookReviewsForm.patchValue({ storyImage: file });
  };

  img.src = URL.createObjectURL(file);
}





  clearStoryImage() {
    this.BookReviewsForm.patchValue({ storyImage: null });
    this.storyImgPreview = null;
    this.showStoryImgBox = false;
    this.storyFileType = '';
  }

  setRating(star: number): void {
    this.BookReviewsForm.get('bookRating')?.setValue(star);
    this.BookReviewsForm.get('bookRating')?.markAsTouched();
  }



  // Function to handle Add/Edit operation
  handleBookreviews() {
    if (this.BookReviewsForm.invalid) {
      this.BookReviewsForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('reviewername', this.BookReviewsForm.get('authorName')?.value);
    formData.append('reviewerjob', this.BookReviewsForm.get('designation')?.value);
    formData.append('aboutreviewer', this.BookReviewsForm.get('aboutAuthor')?.value);
    formData.append('booktitle', this.BookReviewsForm.get('storyTitle')?.value);
    formData.append('content', this.BookReviewsForm.get('storyContent')?.value);
    formData.append('rating', this.BookReviewsForm.get('bookRating')?.value);

    formData.append('createdId', this.adminid);

    const authorImage = this.BookReviewsForm.get('authorImage')?.value;
    if (authorImage instanceof File) {
      formData.append('reviewerimage', authorImage);
    }

    const coverImage = this.BookReviewsForm.get('coverImage')?.value;
    if (coverImage instanceof File) {
      formData.append('bookbannerimage', coverImage);
    }

    const storyImage = this.BookReviewsForm.get('storyImage')?.value;
    if (storyImage instanceof File) {
      formData.append('bookcoverimage', storyImage);
    }

    if (this.ID) {
      formData.append('review_id', this.ID);
    }

    this.Loader = true;

    this.objApiService.handleApiCall('/api/admin/addeditbookreview/', formData, (response) => {
      this.Loader = false;
      if (response['response'] === 'Success') {
        this.showSuccess(response.message);
        // this.BookReviewsForm.reset();
        // this.clearImagePreviews();

        this.ID = null;

        this.router.navigateByUrl('/super-admin/listbookreviews')
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
      this.BookReviewsForm.patchValue({ image: file });
      this.BookReviewsForm.get('image')?.updateValueAndValidity();
    }
  }



  // Function to clear image preview
  clearCard() {
    this.imagePreview = null;
    this.showImageBox = false;
    this.BookReviewsForm.patchValue({ image: null });
    this.BookReviewsForm.get('image')?.updateValueAndValidity();
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
