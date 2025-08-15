import { Component, EventEmitter, Input, Output, signal, WritableSignal } from '@angular/core';
import { PageModel } from '../../model/document-model';
import { SelectedPageService } from '../../services/selected-page.service';

@Component({
  selector: 'app-pages-list',
  imports: [],
  templateUrl: './pages-list.html',
  styleUrl: './pages-list.scss',
})
export class PagesList {
  @Input() pages: PageModel[] = [];

  selectedPage: WritableSignal<PageModel | null> = signal(null);

  constructor(private selectedPageService: SelectedPageService) {}

  ngOnInit(): void {
    this.selectedPage = this.selectedPageService.selectedPage;
  }

  setSelectPage(page: PageModel): void {
    this.selectedPageService.setSelectPage(page);
  }
}
