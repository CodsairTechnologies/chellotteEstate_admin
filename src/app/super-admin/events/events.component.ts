import { Component, ElementRef, ViewChild } from '@angular/core';
import { TableComponent } from '../../common-table/table/table.component';
import Swal from 'sweetalert2';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  selector: 'app-events',
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
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventsComponent {
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

  eventForm !: FormGroup;
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

  eventImagePreview: string | null = null;
  eventFileType: string = '';
  showEventImageBox: boolean = false;
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('galleryFileInput') galleryFileInput!: ElementRef;



  imagePreviews: string[] = [];
  selectedFiles: File[] = [];

  bannerImage: File | null = null;
  eventImage: File | null = null;
  speakerImage: File | null = null;
  galleryImages: File[] = [];
speakerImagePreviews: (string | null)[] = [];

  baseUrl = environment.apiUrl;

  constructor(private formbuilder: FormBuilder, private http: HttpClient, private router: Router, private objApiService: ApiIntegrationService, private route: ActivatedRoute) { }

  ngOnInit(): void {

    this.token = localStorage.getItem("token");
    this.adminid = localStorage.getItem("loginId");
    this.userName = localStorage.getItem("username");
    this.status = localStorage.getItem("status");

    this.eventForm = this.formbuilder.group({
      title: ['', Validators.required],
      bannerImage: [null, Validators.required],
      shortDescription: ['', Validators.required],
      fromDate: ['', Validators.required],
      toDate: [''],
      fromTime: ['', Validators.required],
      toTime: ['', Validators.required],
      location: ['', Validators.required],
      eventImage: [null, Validators.required],
      eventImageDescription: ['', Validators.required],
      speakers: this.formbuilder.array([this.createSpeakerGroup()]),
      gallery: [[]],
    });



    this.route.queryParams.subscribe((params) => {
      const id = params['id'];
      this.isEditMode = !!(id);
      if (id) {
        this.getEventById(id);
      }
    });

  }

  // Getter for speakers FormArray
  get speakers(): FormArray {
    return this.eventForm.get('speakers') as FormArray;
  }

  // Create a new speaker FormGroup
createSpeakerGroup(): FormGroup {
  return this.formbuilder.group({
    name: [''],
    job: [''],
    speakerphoto: [null]   // ✅ Correct key for storing the file
  });
}



  addSpeaker(): void {
    this.speakers.push(this.createSpeakerGroup());
  }


  // events.component.ts

onSpeakerImageChange(event: any, index: number) {
  const file = event.target.files[0];
  if (!file) return;

  // ✅ Only images
  if (!file.type.startsWith('image/')) {
    this.showWarning('Please upload a valid image file.');
    return;
  }

  // ✅ Max size 5MB
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

      // ✅ Minimum dimensions
      if (width < 180 || height < 180) {
        this.showWarning('Image must be at least 180×180 pixels.');
        return;
      }

      // ✅ Square check
      if (Math.abs(width - height) > 1) {
        this.showWarning('Image must be square (width and height must be equal).');
        return;
      }

      // ✅ If all conditions met → set preview and patch form
      this.speakerImagePreviews[index] = e.target.result;
      this.speakers.at(index).patchValue({ speakerphoto: file });
    };
  };

  reader.readAsDataURL(file);
}
triggerSpeakerImageInput(index: number): void {
  const input = document.getElementById('speakerImageInput' + index) as HTMLInputElement;
  input?.click();
}


 removeSpeaker(index: number): void {
  this.speakers.removeAt(index);
}

  galleryPreviews: string[] = []; // for showing gallery images



  // Function to get category details by ID (Edit Mode)
getEventById(id: string) {
  this.ID = id;
  this.Loader = true;

  this.objApiService.handleApiCall('/api/admin/geteventbyid/', { id: this.ID }, (response) => {
    this.Loader = false;

    if (response['response'] === 'Success' && response['event']) {
      const story = response['event'];
      const baseUrl = environment.apiUrl;

      // ✅ Patch basic fields
      this.eventForm.patchValue({
        title: story.bannertitle,
        location: story.location,
        shortDescription: story.bannerdescription,
        fromDate: story.fromdate,
        toDate: story.todate,
        fromTime: story.fromtime,
        toTime: story.totime,
        eventImageDescription: story.eventdescription,
      });

      // ✅ Banner Image
      if (story.image) {
        this.coverPreview = baseUrl + story.image;
        this.showCoverBox = true;
        this.coverFileType = 'image/png'; // optional: detect type
        this.eventForm.get('bannerImage')?.setValue(story.image); // Store path to convert to blob later
      }

      // ✅ Event Image
      if (story.eventimage) {
        this.eventImagePreview = baseUrl + story.eventimage;
        this.showEventImageBox = true;
        this.eventFileType = 'image/png';
        this.eventForm.get('eventImage')?.setValue(story.eventimage); // Store path to convert to blob later
      }

      // ✅ Speakers
      if (story.speakers && Array.isArray(story.speakers)) {
        this.speakers.clear(); // Clear existing

        this.speakerImagePreviews = []; // Clear previews too

        story.speakers.forEach((sp: any, index: number) => {
          const speakerGroup = this.createSpeakerGroup();

          speakerGroup.patchValue({
            name: sp.name || '',
            job: sp.job || '',
            speakerphoto: sp.speakerphoto || '', // Save raw path
          });

          // Preview image for UI
          if (sp.speakerphoto) {
            const photoUrl = baseUrl + sp.speakerphoto;
            this.speakerImagePreviews[index] = photoUrl;
          }

          this.speakers.push(speakerGroup);
        });
      }

      // ✅ Gallery
      if (story.gallery && Array.isArray(story.gallery)) {
        this.selectedFiles = [];
        this.imagePreviews = [];

        story.gallery.forEach((g: any) => {
          const photoUrl = baseUrl + g.photo;
          this.imagePreviews.push(photoUrl);     // For preview
          this.selectedFiles.push(g.photo);      // Store raw path for blob conversion in edit
        });
      }

    } else {
      this.showError(response.message || 'Failed to fetch event details.');
    }
  });
}




  getMimeTypeFromFilename(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      default:
        return 'application/octet-stream';
    }
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

      // ✅ Minimum resolution check
      if (width < 1280 || height < 480) {
        this.showWarning('Banner image must be at least 1280 × 480 pixels.');
        return;
      }

      // ✅ Aspect ratio check (16:6) with tolerance
      const aspectRatio = width / height;
      const expectedRatio = 16 / 6;
      const tolerance = 0.05;
      if (Math.abs(aspectRatio - expectedRatio) > tolerance) {
        this.showWarning('Banner image must have a 16:6 aspect ratio.');
        return;
      }

      // ✅ If valid → preview + form patch
      this.eventForm.patchValue({ bannerImage: file });
      this.eventForm.get('bannerImage')?.updateValueAndValidity();

      this.coverPreview = e.target.result;
      this.coverFileType = fileType;
      this.showCoverBox = true;
    };
  };

  reader.readAsDataURL(file);
}


  onEventImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.eventForm.patchValue({ eventImage: file });
      this.eventImagePreview = URL.createObjectURL(file);
      this.eventFileType = file.type;
      this.showEventImageBox = true;
    }
  }


  // Open File Selector
triggerFileInput() {
  this.galleryFileInput.nativeElement.click();
}

  // Handle File Selection
  onFileSelect(event: any) {
    const files = event.target.files;
    this.handleFiles(files);
  }

  // Handle Drag and Drop
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files) this.handleFiles(files);
  }

  removeImage(index: number) {
    this.imagePreviews.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }



  // Process Selected Files
  handleFiles(files: FileList | null) {
    if (files) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          this.selectedFiles.push(file);

          // Preview the image
          const reader = new FileReader();
          reader.onload = (e: any) => this.imagePreviews.push(e.target.result);
          reader.readAsDataURL(file);
        }
      });
    }
  }
clearCoverImage() {
  this.coverPreview = '';
  this.showCoverBox = false;
  this.eventForm.get('bannerImage')?.setValue(null); // Important
}

clearEventImage() {
  this.eventImagePreview = '';
  this.showEventImageBox = false;
  this.eventForm.get('eventImage')?.setValue(null); // Important
}



  // Function to handle Add/Edit operation
// Function to handle Add/Edit operation
handleEventsubmit() {
  if (this.eventForm.invalid) {
    this.eventForm.markAllAsTouched();
    return;
  }

  const formData = new FormData();

  // Basic fields
  formData.append('bannertitle', this.eventForm.get('title')?.value);
  formData.append('location', this.eventForm.get('location')?.value);
  formData.append('bannerdescription', this.eventForm.get('shortDescription')?.value);
  formData.append('fromdate', this.eventForm.get('fromDate')?.value);
  formData.append('todate', this.eventForm.get('toDate')?.value);
  formData.append('fromtime', this.eventForm.get('fromTime')?.value);
  formData.append('totime', this.eventForm.get('toTime')?.value);
  formData.append('eventdescription', this.eventForm.get('eventImageDescription')?.value);
  formData.append('createdId', this.adminid);

  // BANNER IMAGE (new or existing)
  const bannerFile = this.eventForm.get('bannerImage')?.value;
  if (bannerFile instanceof File) {
    formData.append('image', bannerFile); // new file
  } else if (typeof bannerFile === 'string') {
    const bannerImageUrl = this.baseUrl + bannerFile;
    this.getBlobFromUrl(bannerImageUrl).then((blob) => {
      formData.append('image', blob, 'existing_banner.jpg');
    });
  }

  // EVENT IMAGE (new or existing)
  const eventImageFile = this.eventForm.get('eventImage')?.value;
  if (eventImageFile instanceof File) {
    formData.append('eventimage', eventImageFile); // new file
  } else if (typeof eventImageFile === 'string') {
    const eventImageUrl = this.baseUrl + eventImageFile;
    this.getBlobFromUrl(eventImageUrl).then((blob) => {
      formData.append('eventimage', blob, 'existing_event.jpg');
    });
  }

  // SPEAKERS
  this.eventForm.value.speakers.forEach((speaker: any, index: number) => {
    formData.append(`speakers[${index}][name]`, speaker.name);
    formData.append(`speakers[${index}][job]`, speaker.job);

    if (speaker.speakerphoto instanceof File) {
      formData.append(`speakers[${index}][speakerphoto]`, speaker.speakerphoto);
    } else if (typeof speaker.speakerphoto === 'string') {
      const speakerImageUrl = this.baseUrl + speaker.speakerphoto;
      this.getBlobFromUrl(speakerImageUrl).then((blob) => {
        formData.append(`speakers[${index}][speakerphoto]`, blob, `speaker_${index}.jpg`);
      });
    }
  });

// GALLERY
this.selectedFiles.forEach((fileOrPath, index) => {
  if (fileOrPath instanceof File) {
    // New uploaded image
    formData.append(`gallery[${index}][photo]`, fileOrPath);
  } else if (typeof fileOrPath === 'string') {
    // Existing image path, fetch and convert to blob
    const galleryImageUrl = this.baseUrl + fileOrPath;
    this.getBlobFromUrl(galleryImageUrl).then((blob) => {
      formData.append(`gallery[${index}][photo]`, blob, `gallery_${index}.jpg`);
    });
  }
});


  // ID for edit
  if (this.ID) {
    formData.append('id', this.ID);
  }

  this.Loader = true;

  // Wait a bit for all blobs to finish appending
  setTimeout(() => {
    this.objApiService.handleApiCall('/api/admin/addevent/', formData, (response) => {
      this.Loader = false;

      if (response['response'] === 'Success') {
        this.showSuccess(response.message);
                this.router.navigateByUrl('/super-admin/listevents')

      } else {
        this.showError(response.message || 'Something went wrong.');
      }
    });
  }, 1000); // Delay to allow blob appending to finish
}

getBlobFromUrl(url: string): Promise<Blob> {
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch image from URL');
      }
      return response.blob();
    });
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
