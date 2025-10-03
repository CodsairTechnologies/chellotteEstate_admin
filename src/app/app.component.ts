import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, NgZone, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,

  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',

})
export class AppComponent implements OnInit {
  title = 'man_kind';

  intcurrentIndex = 0;

  arrimg = [
    { logo: '/assets/images/fresh-mango-smoothie 1.png' },
    { logo: '/assets/images/meatballs-rice-beans-broccoli-inside-wooden-bowl 1.png' },
    { logo: '/assets/images/salmon-poke-bowl-flat-lay-photography 1.png' },
    { logo: '/assets/images/watermelon-smoothie 1.png' },

  ];


  currentIndex = 0;
  intervalId: any;

  constructor(private ngZone: NgZone) { }

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        this.ngZone.run(() => {
          this.currentIndex = (this.currentIndex + 1) % this.arrimg.length;
        });
      }, 4000);
    });
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }


}
