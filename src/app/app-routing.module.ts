import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CPdfViewerComponent } from './c-pdf-viewer/c-pdf-viewer.component';
import { CaptureUrlComponent } from './capture-url/capture-url.component';

const routes: Routes = [
  {
    path: 'annotator',
    component: CPdfViewerComponent,
  },
  {
    path: '',
    component: CaptureUrlComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
