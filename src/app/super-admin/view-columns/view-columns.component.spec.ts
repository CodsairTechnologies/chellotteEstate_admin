import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewColumnsComponent } from './view-columns.component';

describe('ViewColumnsComponent', () => {
  let component: ViewColumnsComponent;
  let fixture: ComponentFixture<ViewColumnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewColumnsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewColumnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
