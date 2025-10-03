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
  selector: 'app-short-stories',
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
    CommonModule], templateUrl: './short-stories.component.html',
  styleUrl: './short-stories.component.css'
})
export class ShortStoriesComponent {
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

  ShortStoryForm !: FormGroup;
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

    this.ShortStoryForm = this.formbuilder.group({
      authorName: ['', Validators.required],
      designation: [''],
      aboutAuthor: [''],
      authorImage: [null],
      storyTitle: ['', Validators.required],
      storyContent: ['', Validators.required],
      coverImage: [null, Validators.required],
      // storyImage: [null, Validators.required]
    });

    this.route.queryParams.subscribe((params) => {
      const id = params['id'];
      this.isEditMode = !!(id);
      if (id) {
        this.getShortStoryById(id);
      }
    });

  }



  // Function to get category details by ID (Edit Mode)
  getShortStoryById(id: string) {
    this.ID = id;
    this.Loader = true;

    this.objApiService.handleApiCall('/api/admin/getshortstorybyid/', { id: this.ID }, (response) => {
      this.Loader = false;

      if (response['response'] === 'Success' && response['shortstory']) {
        const story = response['shortstory'];

        this.ShortStoryForm.patchValue({
          authorName: story.reviewername || '',
          designation: story.reviewerjob || '',
          aboutAuthor: story.aboutreviewer || '',
          storyTitle: story.booktitle || '',
          storyContent: story.content || ''
        });

        // Set image previews
        const baseUrl = environment.apiUrl;

        if (story.reviewerimage) {
          const fullPath = baseUrl + story.reviewerimage;
          this.authorImgPreview = fullPath;
          this.showAuthorImgBox = true;
          this.authorFileType = 'image/png';

          this.ShortStoryForm.patchValue({ authorImage: fullPath });
        }

        if (story.bookcoverimage) {
          const fullPath = baseUrl + story.bookcoverimage;
          this.coverPreview = fullPath;
          this.showCoverBox = true;
          this.coverFileType = 'image/png';

          this.ShortStoryForm.patchValue({ coverImage: fullPath });
        }

        // if (story.coverimage) {
        //   const fullPath = baseUrl + story.coverimage;
        //   this.storyImgPreview = fullPath;
        //   this.showStoryImgBox = true;
        //   this.storyFileType = 'image/png';

        //   this.ShortStoryForm.patchValue({ storyImage: fullPath });
        // }


        // if (story.contentimage) {
        //   this.storyImgPreview = baseUrl + story.contentimage;
        //   this.showStoryImgBox = true;
        //   this.storyFileType = 'image/png';
        // }

      } else {
        this.showError(response.message || 'Failed to fetch short story details.');
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

      // ✅ Aspect ratio check (16:6 ≈ 2.66) with tolerance
      const aspectRatio = width / height;
      const expectedRatio = 16 / 6;
      const tolerance = 0.05;
      if (Math.abs(aspectRatio - expectedRatio) > tolerance) {
        this.showWarning('Cover image must have a 16:6 aspect ratio.');
        return;
      }

      // ✅ If valid → preview + form patch
      this.ShortStoryForm.patchValue({ coverImage: file });
      this.ShortStoryForm.get('coverImage')?.updateValueAndValidity();

      this.coverPreview = e.target.result;
      this.coverFileType = fileType;
      this.showCoverBox = true;
    };
  };

  reader.readAsDataURL(file);
}



  clearCoverImage() {
    this.ShortStoryForm.patchValue({ coverImage: null });
    this.coverPreview = null;
    this.showCoverBox = false;
  }



  // onStoryImageUpload(event: any) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     this.ShortStoryForm.patchValue({ storyImage: file });
  //     this.storyImgPreview = URL.createObjectURL(file);
  //     this.storyFileType = file.type;
  //     this.showStoryImgBox = true;
  //   }
  // }

  // clearStoryImage() {
  //   this.ShortStoryForm.patchValue({ storyImage: null });
  //   this.storyImgPreview = null;
  //   this.showStoryImgBox = false;
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
  this.ShortStoryForm.patchValue({ authorImage: file });
  this.ShortStoryForm.get('authorImage')?.updateValueAndValidity();
}

// Clear image
clearAuthorImage() {
  this.authorImgPreview = null;
  this.showAuthorImgBox = false;
  this.ShortStoryForm.patchValue({ authorImage: null });
}




  // Function to handle Add/Edit operation
  handleShortStories() {
    if (this.ShortStoryForm.invalid) {
      this.ShortStoryForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('reviewername', this.ShortStoryForm.get('authorName')?.value);
    formData.append('reviewerjob', this.ShortStoryForm.get('designation')?.value);
    formData.append('aboutreviewer', this.ShortStoryForm.get('aboutAuthor')?.value);
    formData.append('booktitle', this.ShortStoryForm.get('storyTitle')?.value);
    formData.append('content', this.ShortStoryForm.get('storyContent')?.value);
    formData.append('createdId', this.adminid); // optional

    // Conditionally append files
    const authorImage = this.ShortStoryForm.get('authorImage')?.value;
    if (authorImage instanceof File) {
      formData.append('reviewerimage', authorImage);
    }

    const coverImage = this.ShortStoryForm.get('coverImage')?.value;
    if (coverImage instanceof File) {
      formData.append('bookcoverimage', coverImage);
    }

    // const storImage = this.ShortStoryForm.get('storyImage')?.value;
    // if (storImage instanceof File) {
    //   formData.append('coverimage', storImage);
    // }

    // If editing, pass the story ID
    if (this.ID) {
      formData.append('shortstory_id', this.ID);
    }

    this.Loader = true;

    this.objApiService.handleApiCall('/api/admin/addeditshortstory/', formData, (response) => {
      this.Loader = false;
      if (response['response'] === 'Success') {
        this.showSuccess(response.message);
        this.ShortStoryForm.reset();
        this.router.navigateByUrl('/super-admin/listshortstories')

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
      this.ShortStoryForm.patchValue({ image: file });
      this.ShortStoryForm.get('image')?.updateValueAndValidity();
    }
  }



  // Function to clear image preview
  clearCard() {
    this.imagePreview = null;
    this.showImageBox = false;
    this.ShortStoryForm.patchValue({ image: null });
    this.ShortStoryForm.get('image')?.updateValueAndValidity();
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
