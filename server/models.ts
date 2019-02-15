export interface Message {
  text: string;
  author: string;
}

export interface DrawingPoint {
  x: number;
  y: number;
  date: number;
  group: number;
  user: string;
}

export interface DrawingPoints {
  [key: string]: DrawingPoint[][];
}

export interface DB {
  messages: Message[];
  drawingPoints: DrawingPoints;
}

export const db = {
  messages: [],
  drawingPoints: {}
};
