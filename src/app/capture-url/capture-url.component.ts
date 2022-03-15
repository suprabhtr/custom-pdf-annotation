import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-capture-url',
  templateUrl: './capture-url.component.html',
  styleUrls: ['./capture-url.component.css'],
})
export class CaptureUrlComponent implements OnInit {
  pdfURL = '';
  constructor(private router: Router) {}

  ngOnInit(): void {}

  loadTool() {
    console.log(this.pdfURL);
    this.router.navigate(['annotator'], {
      queryParams: { pdfURL: this.pdfURL },
    });
  }
}
