import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListcolumnsComponent } from './listcolumns.component';

describe('ListcolumnsComponent', () => {
  let component: ListcolumnsComponent;
  let fixture: ComponentFixture<ListcolumnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListcolumnsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListcolumnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
