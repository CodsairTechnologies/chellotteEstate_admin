import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookreviewbannerComponent } from './bookreviewbanner.component';

describe('BookreviewbannerComponent', () => {
  let component: BookreviewbannerComponent;
  let fixture: ComponentFixture<BookreviewbannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookreviewbannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookreviewbannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
