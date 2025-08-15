export interface DocumentModel {
  name: string;
  pages: PageModel[];
}

export interface PageModel {
  number: number;
  imageUrl: string;
}
