import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableBookreviewsComponent } from './table-bookreviews.component';

describe('TableBookreviewsComponent', () => {
  let component: TableBookreviewsComponent;
  let fixture: ComponentFixture<TableBookreviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableBookreviewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableBookreviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
