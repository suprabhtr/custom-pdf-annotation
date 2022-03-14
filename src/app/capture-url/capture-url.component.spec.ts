import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaptureUrlComponent } from './capture-url.component';

describe('CaptureUrlComponent', () => {
  let component: CaptureUrlComponent;
  let fixture: ComponentFixture<CaptureUrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaptureUrlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaptureUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
