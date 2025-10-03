import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablePoemsComponent } from './table-poems.component';

describe('TablePoemsComponent', () => {
  let component: TablePoemsComponent;
  let fixture: ComponentFixture<TablePoemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablePoemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablePoemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
