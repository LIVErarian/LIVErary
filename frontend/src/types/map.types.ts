export type FloorType =
  | 'lobby'
  | 'readingFloor'
  | 'conferenceFloor'
  | 'bookTalkFloor'
  | 'bookConcert'
  | 'myRoom';

export interface MapConfig {
  name: string;
  img: string;
  width: number;
  height: number;
}
