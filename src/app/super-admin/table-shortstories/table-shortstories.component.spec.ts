import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableShortstoriesComponent } from './table-shortstories.component';

describe('TableShortstoriesComponent', () => {
  let component: TableShortstoriesComponent;
  let fixture: ComponentFixture<TableShortstoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableShortstoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableShortstoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
