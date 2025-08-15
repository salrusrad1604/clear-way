import { Routes } from '@angular/router';
import { DocumentView } from './components/document-view/document-view';

export const routes: Routes = [
  { path: 'document/:id', component: DocumentView },
  { path: '**', redirectTo: '/document/1' },
];
