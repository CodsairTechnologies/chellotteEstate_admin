import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsbannerComponent } from './eventsbanner.component';

describe('EventsbannerComponent', () => {
  let component: EventsbannerComponent;
  let fixture: ComponentFixture<EventsbannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventsbannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventsbannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
