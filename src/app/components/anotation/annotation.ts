import { Component, EventEmitter, HostBinding, HostListener, Input, Output, signal, WritableSignal } from '@angular/core';
import { Annotation } from '../../model/annotation-model';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-annotation',
  imports: [ButtonModule],
  templateUrl: './annotation.html',
  styleUrl: './annotation.scss',
})
export class Anotation {
  @Input() annotation!: Annotation;
  @Output() onDeleteAnnotation: EventEmitter<null> = new EventEmitter();

  deleteAnnotation(e: Event): void {
    e.preventDefault();
    this.onDeleteAnnotation.emit();
  }
}
