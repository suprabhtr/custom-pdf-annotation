import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'custom-pdf-annotator';
  constructor(private router: Router) {}
  loadNewPDF() {
    localStorage.clear();
    this.router.navigate(['']);
  }
  loadLocalPDF(){
    this.router.navigate(["annotator"])
  }
}
