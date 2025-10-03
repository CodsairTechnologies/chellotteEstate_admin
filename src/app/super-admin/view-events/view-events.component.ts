import { Component, inject, OnInit } from '@angular/core';
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
import { SafeHtmlPipe } from '../../pipe/safe-html.pipe';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-view-events',
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
    CommonModule,
    SafeHtmlPipe],
  templateUrl: './view-events.component.html',
  styleUrl: './view-events.component.css'
})
export class ViewEventsComponent {
  Loader: boolean = false;


  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.getReviewByIdFn(id);
      }
    });
  }

  constructor(private formbuilder: FormBuilder, private http: HttpClient, private router: Router, private objApiService: ApiIntegrationService, private route: ActivatedRoute, private sanitizer: DomSanitizer) { }

  bannerList: { banner: string }[] = [];

  eventDetails: { description: string; summary: string }[] = [];

  eventContentList: { image: string; description: SafeHtml }[] = [];
  speakers: { name: string; job: string; photo: string }[] = [];
  galleryImages: { photo: string }[] = [];

  eventTitle: string = '';

  responsiveOptions = [
    {
      breakpoint: '1024px', // tablet and below
      numVisible: 3,
      numScroll: 1,
    },
    {
      breakpoint: '768px', // mobile and below
      numVisible: 2,
      numScroll: 1,
    },

    {
      breakpoint: '480px', // mobile and below
      numVisible: 1,
      numScroll: 1,
    },
  ];


  getReviewByIdFn(id: string) {

    this.Loader = true;

    this.objApiService.handleApiCall(
      '/api/admin/geteventbyid/',
      { id: id },
      (res) => {
        this.Loader = false;

        console.log('API response:', res);

        if (res.response === 'Success' && res.event) {
          const event = res.event;

          this.eventTitle = event.bannertitle || 'Untitled Event';

          this.bannerList = [
            {
              banner: this.getImageUrl(event.image)
            }
          ];

          this.eventDetails = [
            {
              description: event.bannerdescription,
              summary: `${event.location} | ${event.fromdate} to ${event.todate} | ${event.fromtime} - ${event.totime}`
            }
          ];


          const parser = new DOMParser();
          const parsedDoc = parser.parseFromString(event.eventdescription || '', 'text/html');
          const textContent = parsedDoc.body.textContent?.trim().replace(/\u00A0/g, ' ') || ''; // replace non-breaking space
          const trimmedText = textContent.slice(0, 300) + (textContent.length > 300 ? '...' : '');

          this.eventContentList = [
            {
              image: this.getImageUrl(event.eventimage),
              description: this.sanitizer.bypassSecurityTrustHtml(trimmedText)
            }
          ];


          this.speakers = (event.speakers || [])
            .map((s: any) => ({
              name: s.name,
              job: s.job,
              photo: this.getImageUrl(s.speakerphoto)
            }))
            .filter((s: any) => s.name || s.job || s.photo);




          this.galleryImages = event.gallery?.map((g: any) => ({
            photo: this.getImageUrl(g.photo)
          })) || [];



        } else {
          // this.showError(res.message || 'Something went wrong.');
        }
      }
    );
  }


  getImageUrl(path: string): string {
    if (!path) return '';
    return `${environment.apiUrl}/${path}`;
  }


  // getImageUrl(path: string): string {
  //   if (!path) return '';
  //   return path.startsWith('/') ? environment.apiUrl + path : path;
  // }



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
