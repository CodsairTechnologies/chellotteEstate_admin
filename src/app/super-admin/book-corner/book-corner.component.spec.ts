import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookCornerComponent } from './book-corner.component';

describe('BookCornerComponent', () => {
  let component: BookCornerComponent;
  let fixture: ComponentFixture<BookCornerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookCornerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookCornerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
