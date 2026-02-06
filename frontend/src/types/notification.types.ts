export interface Notification {
  notificationId: string;
  content: string;
  relatedUrl: string;
  read: boolean;
  type: 'FRIEND_REQUEST' | 'INQUIRY_REVIEW' | 'BOARD_REVIEW';
  createdAt: string;
}

export interface NotificationResponse {
  status: string;
  code: string;
  message: string;
  data: Notification[];
}
