import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Annotation } from '../model/annotation-model';

const STORAGE_KEY = 'CLEAR_ANNOTATIONS';

@Injectable({
  providedIn: 'root',
})
export class AnnotationsService {
  getAnnotationById(id: string | null): Observable<Annotation[]> {
    const key = STORAGE_KEY + id;
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify([]));
    }
    return of(JSON.parse(localStorage.getItem(key) as string));
  }

  deleteAnnotation(id: string | null, annotation: Annotation): void {
    const key = STORAGE_KEY + id;

    const annotations = JSON.parse(localStorage.getItem(key) as string).filter((item: Annotation) => item.id != annotation.id);

    localStorage.setItem(key, JSON.stringify(annotations));
  }

  createAnnotation(id: string | null, annotation: Annotation): void {
    if (!annotation.text) return;

    const key = STORAGE_KEY + id;

    const annotations = JSON.parse(localStorage.getItem(key) as string);
    annotations.push(annotation);

    localStorage.setItem(key, JSON.stringify(annotations));
  }

  updateAnnotationPossition(id: string | null, annotation: Annotation): void {
    const key = STORAGE_KEY + id;

    const annotations = JSON.parse(localStorage.getItem(key) as string);
    annotations.forEach((item: Annotation) => {
      if (item.id === annotation.id) {
        item.x = annotation.x;
        item.y = annotation.y;
      }
    });

    localStorage.setItem(key, JSON.stringify(annotations));
  }

  saveAnnotations(id: string | null): void {
    const key = STORAGE_KEY + id;
    const annotations = JSON.parse(localStorage.getItem(key) as string).map(({ text }: Annotation) => text);
    const text = annotations.length ? `добавлены аннотации ${annotations.join(', ')}` : 'нет аннотаций';

    console.info(`В документ с ID = ${id} ${text}`);
  }
}
