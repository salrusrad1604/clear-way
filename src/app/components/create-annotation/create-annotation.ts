import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AutoFocusModule } from 'primeng/autofocus';

@Component({
  selector: 'app-create-annotation',
  imports: [FormsModule, InputTextModule, ButtonModule, AutoFocusModule],
  templateUrl: './create-annotation.html',
  styleUrl: './create-annotation.scss',
})
export class CreateAnnotation {
  @Output() onClose: EventEmitter<null> = new EventEmitter();
  @Output() onSuccess: EventEmitter<null> = new EventEmitter();

  value: string = '';
}
