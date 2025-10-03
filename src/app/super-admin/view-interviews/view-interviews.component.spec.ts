import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewInterviewsComponent } from './view-interviews.component';

describe('ViewInterviewsComponent', () => {
  let component: ViewInterviewsComponent;
  let fixture: ComponentFixture<ViewInterviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewInterviewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewInterviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
