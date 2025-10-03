import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableInterviewsComponent } from './table-interviews.component';

describe('TableInterviewsComponent', () => {
  let component: TableInterviewsComponent;
  let fixture: ComponentFixture<TableInterviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableInterviewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableInterviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
