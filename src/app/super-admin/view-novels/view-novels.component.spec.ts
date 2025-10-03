import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewNovelsComponent } from './view-novels.component';

describe('ViewNovelsComponent', () => {
  let component: ViewNovelsComponent;
  let fixture: ComponentFixture<ViewNovelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewNovelsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewNovelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
