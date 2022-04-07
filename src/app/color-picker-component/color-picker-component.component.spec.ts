import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorPickerComponentComponent } from './color-picker-component.component';

describe('ColorPickerComponentComponent', () => {
  let component: ColorPickerComponentComponent;
  let fixture: ComponentFixture<ColorPickerComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ColorPickerComponentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorPickerComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
