import {
  Component,
  ComponentRef,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  ViewChild,
  ViewContainerRef,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { switchMap, take } from 'rxjs';
import { DocumentModel } from '../../model/document-model';
import { DocumentService } from '../../services/document.service';
import { Annotation } from '../../model/annotation-model';
import { AnnotationsService } from '../../services/annotations.service';
import { Anotation } from '../anotation/annotation';
import { CreateAnnotation } from '../create-annotation/create-annotation';

@Component({
  selector: 'app-document-view',
  imports: [ButtonModule, Anotation],
  templateUrl: './document-view.html',
  styleUrl: './document-view.scss',
})
export class DocumentView {
  private destroyRef = inject(DestroyRef);
  private document: WritableSignal<DocumentModel | null> = signal(null);

  annotations: WritableSignal<Annotation[]> = signal([]);
  header = computed(() => this.document()?.name || '');
  pages = computed(() => this.document()?.pages || []);

  readonly maxScale = 10;
  scale = signal(0);
  isZoomPlus = computed(() => this.scale() >= this.maxScale);
  isZoomMinus = computed(() => this.scale() <= -this.maxScale);

  @ViewChild('zoomContainer') zoomContainer!: ElementRef;
  @ViewChild('dynamicComponent', { read: ViewContainerRef }) viewRef!: ViewContainerRef;

  constructor(private route: ActivatedRoute, private documentService: DocumentService, private annotationsService: AnnotationsService) {}

  ngOnInit(): void {
    this.getDocument();
    this.getAnnotations();
  }

  ngAfterViewInit(): void {
    this.addCreate();
  }

  ngAfterViewChecked(): void {
    this.addMove();
  }

  private addCreate(): void {
    this.zoomContainer.nativeElement.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault();
      this.createAnnotationComponent(e);
    });
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

  zoom(type: 'plus' | 'minus' | 'init'): void {
    const scale = 1.1;
    switch (type) {
      case 'init':
        this.zoomContainer.nativeElement.style.width = '100%';
        this.scale.set(0);
        break;
      case 'plus':
        this.zoomContainer.nativeElement.style.width = this.zoomContainer.nativeElement.offsetWidth * scale + 'px';
        this.scale.update(v => v + 1);
        break;
      case 'minus':
        this.zoomContainer.nativeElement.style.width = this.zoomContainer.nativeElement.offsetWidth / scale + 'px';
        this.scale.update(v => v - 1);
        break;
    }
  }

  addMove(): void {
    const draggableElements = document.querySelectorAll('.annotation');
    let isDragging = false;
    let currentElement: any = null;
    let offsetX: any = null;
    let offsetY: any = null;

    draggableElements.forEach(element => {
      element.addEventListener('mousedown', e => {
        e.preventDefault();
        isDragging = true;
        currentElement = element;
        offsetX = (e as MouseEvent).clientX - currentElement.offsetLeft;
        offsetY = (e as MouseEvent).clientY - currentElement.offsetTop;
        currentElement.style.cursor = 'grabbing';
      });
    });

    document.addEventListener('mousemove', e => {
      if (!isDragging) return;
      e.preventDefault();
      const pageImgWidth = this.zoomContainer.nativeElement.offsetWidth;
      const pageImgHeigth = this.zoomContainer.nativeElement.offsetHeight;
      currentElement.style.left = 100 * ((e.clientX - offsetX) / pageImgWidth) + '%';
      currentElement.style.top = 100 * ((e.clientY - offsetY) / pageImgHeigth) + '%';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        currentElement.style.cursor = 'grab';
        const currId = currentElement.getAttribute('data-target');
        const newAnnotation = this.annotations().find(({ id }) => id === currId) as Annotation;

        this.annotationsService.updateAnnotationPossition(this.route.snapshot.params['id'], {
          ...newAnnotation,
          x: parseFloat(currentElement.style.left),
          y: parseFloat(currentElement.style.top),
        });
        currentElement = null;
      }
    });
  }

  createAnnotationComponent(e: MouseEvent) {
    this.viewRef.clear();
    const componentRef: ComponentRef<CreateAnnotation> = this.viewRef.createComponent(CreateAnnotation);

    const zoomContainerWidth = this.zoomContainer.nativeElement.offsetWidth;
    const zoomContainerHeigth = this.zoomContainer.nativeElement.offsetHeight;
    const zoomContainerLeft = this.zoomContainer.nativeElement.offsetLeft;
    const zoomContainerTop = this.zoomContainer.nativeElement.offsetTop;

    var screenPosition = this.zoomContainer.nativeElement.getBoundingClientRect();

    const x = 100 * ((e.clientX - zoomContainerLeft - screenPosition.left + Math.max(screenPosition.x, 20)) / zoomContainerWidth);
    const y = 100 * ((e.clientY - zoomContainerTop - screenPosition.top + 20) / zoomContainerHeigth);

    componentRef.location.nativeElement.style.position = 'absolute';
    componentRef.location.nativeElement.style.left = x + '%';
    componentRef.location.nativeElement.style.top = y + '%';

    componentRef.instance.onClose.pipe(take(1), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.viewRef.clear());
    componentRef.instance.onSuccess.pipe(take(1), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const id = new Date().getTime().toString();
      const text = componentRef.instance.value;
      const annotation = { id, x, y, text };
      this.createAnnotation(annotation);
      this.viewRef.clear();
    });
  }

  deleteAnnotation(annotation: Annotation): void {
    this.annotationsService.deleteAnnotation(this.route.snapshot.params['id'], annotation);
    this.getAnnotations();
  }

  createAnnotation(annotation: Annotation): void {
    this.annotationsService.createAnnotation(this.route.snapshot.params['id'], annotation);
    this.getAnnotations();
  }

  save(): void {
    this.annotationsService.saveAnnotations(this.route.snapshot.params['id']);
  }
}
