import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Annotation, Annotations } from '../model/annotation-model';

const STORAGE_KEY = 'CLEAR_ANNOTATIONS';

@Injectable({
  providedIn: 'root',
})
export class AnnotationsService {
  getAnnotationById(id: string | null): Observable<Annotations> {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
    }
    return of(JSON.parse(localStorage.getItem(STORAGE_KEY) as string));
  }

  deleteAnnotation(page: number, annotation: Annotation): void {
    const annotations = JSON.parse(localStorage.getItem(STORAGE_KEY) as string);
    annotations[page] = annotations[page].filter((item: Annotation) => item.id != annotation.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations));
  }

  createAnnotation(page: number, annotation: Annotation): void {
    const annotations = JSON.parse(localStorage.getItem(STORAGE_KEY) as string);
    if (annotations[page]) {
      annotations[page].push(annotation);
    } else {
      annotations[page] = [annotation];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations));
  }

  updateAnnotationPossition(page: number, annotation: Annotation): void {
    const annotations = JSON.parse(localStorage.getItem(STORAGE_KEY) as string);
    annotations[page].forEach((item: Annotation) => {
      if (item.id === annotation.id) {
        item.x = annotation.x;
        item.y = annotation.y;
      }
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations));
  }
}
