export interface DailyEvent {
  day: string;
  views: number;
  clicks: number;
}

export interface ClickBucket {
  bucket: string;
  count: number;
}
