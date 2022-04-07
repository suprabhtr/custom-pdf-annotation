import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ColorPickerModule } from 'ngx-color-picker';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CPdfViewerComponent } from './c-pdf-viewer/c-pdf-viewer.component';
import { CaptureUrlComponent } from './capture-url/capture-url.component';
import { ColorPickerComponentComponent } from './color-picker-component/color-picker-component.component';

@NgModule({
  declarations: [AppComponent, CPdfViewerComponent, CaptureUrlComponent, ColorPickerComponentComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PdfViewerModule,
    ColorPickerModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
