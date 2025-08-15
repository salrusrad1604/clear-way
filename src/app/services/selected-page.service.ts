import { Injectable, signal, WritableSignal } from '@angular/core';
import { PageModel } from '../model/document-model';

@Injectable({
  providedIn: 'root',
})
export class SelectedPageService {
  selectedPage: WritableSignal<PageModel | null> = signal(null);

  setSelectPage(page: PageModel): void {
    this.selectedPage.set(page);
  }
}
