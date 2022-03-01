import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPdfViewerComponent } from './c-pdf-viewer.component';

describe('CPdfViewerComponent', () => {
  let component: CPdfViewerComponent;
  let fixture: ComponentFixture<CPdfViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CPdfViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CPdfViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
