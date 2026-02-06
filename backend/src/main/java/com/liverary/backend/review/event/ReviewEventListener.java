package com.liverary.backend.review.event;

import com.liverary.backend.board.domain.Type;
import com.liverary.backend.notification.domain.NotificationType;
import com.liverary.backend.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReviewEventListener {

    private final NotificationService notificationService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleReviewCreatedEvent(ReviewCreatedEvent event) {
        try {
            //sendNotification(event);
        }
        catch (Exception e){
            log.error("댓글 알림 전송 실패: targetUser={}, error={}", event.receiver().getUserId(), e.getMessage());
        }
    }

    private void sendNotification(ReviewCreatedEvent event){
        NotificationType notificationType;
        String notificationContent;
        String boardTitle = event.board().getTitle();

        // 게시판 타입에 따라 알림 메세지 분기 처리
        if(event.board().getType()== Type.INQUIRY){
            notificationType = NotificationType.INQUIRY_REVIEW;
            notificationContent = "회원님의 문의글에 답변이 등록되었습니다.";
        }
        else{
            notificationType = NotificationType.BOARD_REVIEW;
            if(boardTitle.length() > 50) {
                boardTitle = boardTitle.substring(0, 50)+ "...";
            }
            notificationContent = String.format("회원님의 '%s' 게시글에 새로운 댓글이 달렸습니다.", boardTitle);
        }

        // 알림 서비스 호출
        notificationService.send(event.receiver(), notificationType, notificationContent);

    }



}
