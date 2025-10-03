import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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
  selector: 'app-view-poem',
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
  templateUrl: './view-poem.component.html',
  styleUrl: './view-poem.component.css'
})
export class ViewPoemComponent {

  Loader: boolean = false;


  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.getPoemByIdFn(id);
      }
    });
  }

  constructor(private formbuilder: FormBuilder, private http: HttpClient, private router: Router, private objApiService: ApiIntegrationService, private route: ActivatedRoute, private sanitizer: DomSanitizer) { }






  poems = [
    {
      banner: '',
      writerImage: '',
      name: '',
      subtitle: '',
      description: '',
      title: '',
      bannertitle:''
    }
  ];

  poemDetails: any[] = [];


  getPoemByIdFn(id: string) {

    this.Loader = true;

    this.objApiService.handleApiCall(
      '/api/admin/getpoemsbyid/',
      { id: id },
      (res) => {
        this.Loader = false;

        console.log('API response:', res);

        if (res.response === 'Success' && res.poem) {
          const review = res.poem;

          const contentArray: { type: 'html' | 'image'; data: string | SafeHtml }[] = [];
          const parser = new DOMParser();
          const doc = parser.parseFromString(review.content || '', 'text/html');
          const nodes = Array.from(doc.body.childNodes);

          const blockTags = ['P', 'UL', 'OL', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE'];

          for (const node of nodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as HTMLElement;

              // Handle <img> directly
              if (el.tagName === 'IMG') {
                const src = el.getAttribute('src');
                if (src) {
                  contentArray.push({ type: 'image', data: src });
                }
                continue;
              }

              // Handle block-level HTML elements
              if (blockTags.includes(el.tagName)) {
                // Extract any <img> inside
                const imgs = el.querySelectorAll('img');
                imgs.forEach((img) => {
                  const src = img.getAttribute('src');
                  if (src) {
                    contentArray.push({ type: 'image', data: src });
                  }
                });

                let html = el.outerHTML.trim().replace(/&nbsp;/g, ' ');
                if (html && html !== '<p></p>') {
                  contentArray.push({
                    type: 'html',
                    data: this.sanitizer.bypassSecurityTrustHtml(html)
                  });
                }
              }
            }
          }

          // Assign poem data
          this.poems = [{
            banner: this.getImageUrl(review.bannerimage),
            bannertitle: review.bannertitle,
            title: review.booktitle,
            writerImage: this.getImageUrl(review.reviewerimage),
            name: review.reviewername || 'Unknown',
            subtitle: review.reviewerjob || '',
            description: review.aboutreviewer || ''
          }];

          this.poemDetails = [{
            title: review.booktitle,
            name: review.reviewername || 'Unknown',
            timestamp: `${review.uploaddate} ${review.uploadtime}`,
            paragraphs: contentArray
          }];

          console.log('Parsed poemDetails:', this.poemDetails);
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