export interface Notification {
  notificationId: string;
  content: string;
  type: 'FRIEND_REQUEST' | 'INQUIRY_REVIEW' | 'BOARD_REVIEW';
  read: boolean;
  createdAt: string;
  targetId?: string;
}

export interface NotificationResponse {
  status: string;
  code: string;
  message: string;
  data: Notification[];
}
