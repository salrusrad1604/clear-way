export interface Annotations {
  [key: number]: Annotation[];
}

export interface Annotation {
  x: number;
  y: number;
  text: string;
  id: string;
}
