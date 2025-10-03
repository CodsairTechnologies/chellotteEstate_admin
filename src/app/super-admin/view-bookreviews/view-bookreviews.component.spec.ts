import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBookreviewsComponent } from './view-bookreviews.component';

describe('ViewBookreviewsComponent', () => {
  let component: ViewBookreviewsComponent;
  let fixture: ComponentFixture<ViewBookreviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewBookreviewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewBookreviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
