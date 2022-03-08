import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CPdfViewerComponent } from './c-pdf-viewer/c-pdf-viewer.component';

@NgModule({
  declarations: [AppComponent, CPdfViewerComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PdfViewerModule,
    ColorPickerModule,
    FormsModule,
    NgxExtendedPdfViewerModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
