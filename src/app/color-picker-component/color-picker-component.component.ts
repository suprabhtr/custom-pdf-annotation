import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-color-picker-component',
  templateUrl: './color-picker-component.component.html',
  styleUrls: ['./color-picker-component.component.css']
})
export class ColorPickerComponentComponent implements OnInit {

  @Input() presetColors:any;
  @Output() selectedColorChange: EventEmitter<string> = new EventEmitter<string>();

  @Input() selectedColor!:string;

  constructor() { }

  ngOnInit(): void {
    this.selectedColor = this.presetColors[0];
    this.selectedColorChange.emit(this.selectedColor);
  }

  onColorSelected(color:string){
    this.selectedColor=color;
    this.selectedColorChange.emit(this.selectedColor);
  }
}
