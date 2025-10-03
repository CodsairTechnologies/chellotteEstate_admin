import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeBookreviewComponent } from './home-bookreview.component';

describe('HomeBookreviewComponent', () => {
  let component: HomeBookreviewComponent;
  let fixture: ComponentFixture<HomeBookreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeBookreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeBookreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
