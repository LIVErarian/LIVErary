export type FloorType =
  | 'lobby'
  | 'readingFloor'
  | 'conferenceFloor'
  | 'bookTalkFloor'
  | 'bookConcert'
  | 'myRoom';

export interface MapConfig {
  floorId: string;
  name: string;
  img: string;
  width?: number;
  height?: number;
}
