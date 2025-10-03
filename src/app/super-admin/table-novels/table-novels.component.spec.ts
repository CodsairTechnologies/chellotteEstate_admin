import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableNovelsComponent } from './table-novels.component';

describe('TableNovelsComponent', () => {
  let component: TableNovelsComponent;
  let fixture: ComponentFixture<TableNovelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableNovelsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableNovelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
