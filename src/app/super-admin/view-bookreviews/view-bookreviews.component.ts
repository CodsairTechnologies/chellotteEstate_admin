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
  selector: 'app-view-bookreviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-bookreviews.component.html',
  styleUrl: './view-bookreviews.component.css'
})
export class ViewBookreviewsComponent {
  Loader: boolean = false;


  constructor(private formbuilder: FormBuilder, private http: HttpClient, private router: Router, private objApiService: ApiIntegrationService, private route: ActivatedRoute, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.getReviewByIdFn(id);
      }
    });
  }




  poems = [
    {
      banner: '',
      writerImage: '',
      name: '',
      subtitle: '',
      description: ''
    }
  ];

  poemDetails: any[] = [];



  getReviewByIdFn(id: string) {
    this.Loader = true;

    this.objApiService.handleApiCall(
      '/api/admin/getbookreviewbyid/',
      { id: id },
      (res) => {
        this.Loader = false;

        if (res.response === 'Success' && res.review) {
          const review = res.review;
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
          // Patch reviewer data into poems
          this.poems = [{
            banner: this.getImageUrl(review.bookbannerimage),
            writerImage: this.getImageUrl(review.reviewerimage),
            name: review.reviewername || 'Unknown',
            subtitle: review.reviewerjob || '',
            description: review.aboutreviewer || ''
          }];

          // Patch poem details with mixed content
          this.poemDetails = [{
            title: review.booktitle,
            timestamp: `${review.uploaddate} ${review.uploadtime}`,
            name: review.reviewername,
            // paragraphs: this.parseReviewContent(review.content)
            paragraphs: contentArray,
            rating: Number(review.rating)

          }];
        } else if (res.response === 'Warning') {
          // this.showError(res.message);
        } else {
          // this.showError('Something went wrong. Please try again.');
        }
      }
    );
  }

  parseReviewContent(content: any): any[] {
    if (!content || content === 'null') {
      return [{ type: 'text', data: 'No content available.' }];
    }

    const output: { type: string, data: string }[] = [];

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const bodyChildren = Array.from(doc.body.childNodes);

      for (const node of bodyChildren) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;

          if (element.tagName === 'IMG') {
            const src = element.getAttribute('src');
            if (src) {
              output.push({ type: 'image', data: src });
            }
          } else {
            // Handle <p>, <div>, <span>, etc. as text
            const text = element.innerText.trim();
            if (text) {
              output.push({ type: 'text', data: text });
            }
          }
        } else if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent?.trim();
          if (text) {
            output.push({ type: 'text', data: text });
          }
        }
      }

      return output.length ? output : [{ type: 'text', data: 'No content found.' }];
    } catch (err) {
      console.error('Error parsing content:', err);
      return [{ type: 'text', data: content }];
    }
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