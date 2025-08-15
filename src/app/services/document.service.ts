import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DocumentModel } from '../model/document-model';
import { documentMock } from '../../mock/mock-document';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  getDocumentById(id: string | null): Observable<DocumentModel> {
    return of(documentMock);
  }
}
