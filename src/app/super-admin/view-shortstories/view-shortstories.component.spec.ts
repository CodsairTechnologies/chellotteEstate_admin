import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewShortstoriesComponent } from './view-shortstories.component';

describe('ViewShortstoriesComponent', () => {
  let component: ViewShortstoriesComponent;
  let fixture: ComponentFixture<ViewShortstoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewShortstoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewShortstoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
