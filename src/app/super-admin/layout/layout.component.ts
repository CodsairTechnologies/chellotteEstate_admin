import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, DialogModule,
    RouterOutlet
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  @ViewChild('mainSection') mainSection!: ElementRef;


  isSidebarToggled: boolean = false;
  isSubMenuOpen: boolean = false;


  isCollapsed: boolean[] = [];

  display: boolean = false;

  Loader: boolean = false;
  isDropdownopen: boolean = false;

  category: boolean = false;
  isFoodDropdownOpen: boolean = false;

  isSidebarClosed: boolean = false;
  isClosed: boolean = false;

  token: any;
  adminid: any;
  userName: any;
  status: any;


  constructor(private router: Router,) {

  }

  ngOnInit(): void {

    this.token = localStorage.getItem("token");
    this.adminid = localStorage.getItem("loginId");
    this.userName = localStorage.getItem("username");
    this.status = localStorage.getItem("status");

  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // Check if clicked element is NOT inside the dropdown container
    if (!target.closest('.right-icons')) {
      this.dropdownVisible = false;
    }
  }

  toggleSidebar() {
    this.isSidebarClosed = !this.isSidebarClosed;
  }

  reloadCurrentPage() {
    window.location.reload();
  }

  showDialog() {
    this.display = true;
  }

  toggleCollapse(index: number) {
    this.isCollapsed[index] = !this.isCollapsed[index];
  }

  stopPropagation(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }


  onReject() {
    this.display = false;
  }


  confirmLogout() {
    this.display = true; // Show the confirmation modal
  }

logout() {
  this.Loader = true;

  // Clear session storage completely
  sessionStorage.clear();

  // Remove only login session keys from localStorage
  const savedUsername = localStorage.getItem('savedUsername');
  const savedPassword = localStorage.getItem('savedPassword');
  const savedTime = localStorage.getItem('savedTime');

  localStorage.clear(); // clear all
  // Restore Remember Me data after clear
  if (savedUsername && savedPassword && savedTime) {
    localStorage.setItem('savedUsername', savedUsername);
    localStorage.setItem('savedPassword', savedPassword);
    localStorage.setItem('savedTime', savedTime);
  }

  setTimeout(() => {
    this.router.navigate(['/login']);

    Swal.fire({
      icon: 'success',
      title: 'Logged out successfully',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });

    this.display = false;
    this.Loader = false;
  }, 2000);
}


  dropdownVisible = false;

  toggleDropdown() {
    this.dropdownVisible = !this.dropdownVisible;
  }

  goToSettings() {
    this.dropdownVisible = false;
    this.router.navigate(['/super-admin/settings']);
  }



}
