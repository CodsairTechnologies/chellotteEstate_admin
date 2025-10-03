import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortStoriesComponent } from './short-stories.component';

describe('ShortStoriesComponent', () => {
  let component: ShortStoriesComponent;
  let fixture: ComponentFixture<ShortStoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortStoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShortStoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
