import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableArticlesComponent } from './table-articles.component';

describe('TableArticlesComponent', () => {
  let component: TableArticlesComponent;
  let fixture: ComponentFixture<TableArticlesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableArticlesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableArticlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
