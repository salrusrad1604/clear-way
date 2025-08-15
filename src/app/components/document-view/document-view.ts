import { Component, computed, DestroyRef, inject, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { switchMap, take } from 'rxjs';
import { DocumentModel, PageModel } from '../../model/document-model';
import { DocumentService } from '../../services/document.service';
import { Annotation, Annotations } from '../../model/annotation-model';
import { AnnotationsService } from '../../services/annotations.service';
import { PagesList } from '../pages-list/pages-list';
import { PageView } from '../page-view/page-view';
import { SelectedPageService } from '../../services/selected-page.service';

@Component({
  selector: 'app-document-view',
  imports: [ButtonModule, PagesList, PageView],
  templateUrl: './document-view.html',
  styleUrl: './document-view.scss',
})
export class DocumentView {
  private destroyRef = inject(DestroyRef);
  private document: WritableSignal<DocumentModel | null> = signal(null);
  private annotations: WritableSignal<Annotations> = signal({});

  header = computed(() => this.document()?.name || '');
  pages = computed(() => this.document()?.pages || []);
  selectedPage: WritableSignal<PageModel | null> = signal(null);
  selectAnnotations = computed(() => {
    const selectPage = this.selectedPage();
    return selectPage ? this.annotations()[selectPage.number] : [];
  });

  constructor(
    private route: ActivatedRoute,
    private documentService: DocumentService,
    private annotationsService: AnnotationsService,
    private selectedPageService: SelectedPageService,
  ) {}

  ngOnInit(): void {
    this.getDocument();
    this.getAnnotations();
    this.getSelectPage();
  }

  private getSelectPage(): void {
    this.selectedPage = this.selectedPageService.selectedPage;
  }

  private getDocument(): void {
    this.route.paramMap
      .pipe(
        switchMap(params => {
          return this.documentService.getDocumentById(params.get('id'));
        }),
        take(1),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(document => {
        this.document.set(document);
        if (!this.selectedPage()) {
          this.selectedPageService.setSelectPage(document.pages[0]);
        }
      });
  }

  private getAnnotations(): void {
    this.route.paramMap
      .pipe(
        switchMap(params => {
          return this.annotationsService.getAnnotationById(params.get('id'));
        }),
        take(1),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(annotations => {
        this.annotations.set(annotations);
      });
  }

  zoom(type: 'plus' | 'minus'): void {
    const page = document.querySelector('app-page-view')?.querySelector('.container');
    const height = page?.clientHeight || 0;

    if (page) {
      const scale = 1.1;
      (page as HTMLElement).style.height = (type === 'plus' ? scale * height : height / scale) + 'px';
    }
  }

  deleteAnnotation(data: { annotation: Annotation; pageNumber: number }): void {
    this.annotationsService.deleteAnnotation(data.pageNumber, data.annotation);
    this.getAnnotations();
  }

  createAnnotation(data: { annotation: Annotation; pageNumber: number }): void {
    this.annotationsService.createAnnotation(data.pageNumber, data.annotation);
    this.getAnnotations();
  }
}
