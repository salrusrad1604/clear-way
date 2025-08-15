import {
  Component,
  ComponentRef,
  DestroyRef,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  Output,
  SimpleChange,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { PageModel } from '../../model/document-model';
import { Annotation } from '../../model/annotation-model';
import { Anotation } from '../anotation/annotation';
import { AnnotationsService } from '../../services/annotations.service';
import { CreateAnnotation } from '../create-annotation/create-annotation';
import { take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-page-view',
  imports: [Anotation, CreateAnnotation],
  templateUrl: './page-view.html',
  styleUrl: './page-view.scss',
})
export class PageView {
  @Input() page!: PageModel | null;
  @Input() annotations: Annotation[] | null = [];
  @Output() onDeleteAnnotion: EventEmitter<{ annotation: Annotation; pageNumber: number }> = new EventEmitter();
  @Output() onCreateAnnotion: EventEmitter<{ annotation: Annotation; pageNumber: number }> = new EventEmitter();

  @ViewChild('pageImgContainer') pageImgContainer!: ElementRef;
  @ViewChild('dynamicComponent', { read: ViewContainerRef }) viewRef!: ViewContainerRef;

  @HostListener('contextmenu', ['$event'])
  onClick(e: Event) {
    e.preventDefault();
    this.createAnnotation(e as MouseEvent);
  }

  private destroyRef = inject(DestroyRef);

  constructor(private annotationsService: AnnotationsService) {}

  ngOnChanges(): void {
    if (this.viewRef) this.viewRef.clear();
  }

  ngAfterViewChecked(): void {
    this.addMove();
  }

  createAnnotation(e: MouseEvent) {
    this.viewRef.clear();
    const componentRef: ComponentRef<CreateAnnotation> = this.viewRef.createComponent(CreateAnnotation);

    const pageImgWidth = this.pageImgContainer.nativeElement.offsetWidth;
    const pageImgHeigth = this.pageImgContainer.nativeElement.offsetHeight;

    const x = Math.max(0, Math.min(Math.floor((100 * (e.clientX - this.pageImgContainer.nativeElement.offsetLeft)) / pageImgWidth), 100));
    const y = Math.max(0, Math.min(Math.floor((100 * (e.clientY - this.pageImgContainer.nativeElement.offsetTop)) / pageImgHeigth), 100));

    componentRef.location.nativeElement.style.position = 'absolute';
    componentRef.location.nativeElement.style.left = x + '%';
    componentRef.location.nativeElement.style.top = y + '%';

    componentRef.instance.onClose.pipe(take(1), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.viewRef.clear());
    componentRef.instance.onSuccess.pipe(take(1), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const pageNumber = this.page?.number as number;
      const id = new Date().getTime().toString();
      const text = componentRef.instance.value;
      const annotation = { id, x, y, text };
      this.onCreateAnnotion.emit({ pageNumber, annotation });
      this.viewRef.clear();
    });
  }

  addMove(): void {
    const draggableElements = document.querySelectorAll('.annotation');
    let isDragging = false;
    let currentElement: any = null;
    let offsetX: any = null;
    let offsetY: any = null;

    draggableElements.forEach(element => {
      element.addEventListener('mousedown', e => {
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

      const pageImgWidth = this.pageImgContainer.nativeElement.offsetWidth;
      const pageImgHeigth = this.pageImgContainer.nativeElement.offsetHeight;
      const left = Math.max(0, Math.min(Math.floor((100 * (e.clientX - offsetX)) / pageImgWidth), 100));
      const top = Math.max(0, Math.min(Math.floor((100 * (e.clientY - offsetY)) / pageImgHeigth), 100));
      currentElement.style.left = left + '%';
      currentElement.style.top = top + '%';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        currentElement.style.cursor = 'grab';
        const pageNumber = this.page?.number as number;
        const newAnnotation = (this.annotations as Annotation[]).find(
          ({ id }) => id === currentElement.getAttribute('data-target'),
        ) as Annotation;

        this.annotationsService.updateAnnotationPossition(pageNumber, {
          ...newAnnotation,
          x: parseInt(currentElement.style.left),
          y: parseInt(currentElement.style.top),
        });
        currentElement = null;
      }
    });
  }

  deleteAnnotation(annotation: Annotation): void {
    const pageNumber = this.page?.number as number;
    this.onDeleteAnnotion.emit({ annotation, pageNumber });
  }
}
