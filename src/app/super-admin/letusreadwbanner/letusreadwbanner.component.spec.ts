import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LetusreadwbannerComponent } from './letusreadwbanner.component';

describe('LetusreadwbannerComponent', () => {
  let component: LetusreadwbannerComponent;
  let fixture: ComponentFixture<LetusreadwbannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LetusreadwbannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LetusreadwbannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
