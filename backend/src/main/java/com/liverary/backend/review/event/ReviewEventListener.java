package com.liverary.backend.review.event;

import com.liverary.backend.board.domain.Board;
import com.liverary.backend.board.domain.Type;
import com.liverary.backend.board.repository.BoardRepository;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.notification.domain.NotificationType;
import com.liverary.backend.notification.service.NotificationService;
import com.liverary.backend.user.domain.User;
import com.liverary.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReviewEventListener {

    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final BoardRepository boardRepository;

    /**
     * 댓글 생성 이벤트를 수신하여 알림을 전송하는 핸들러
     *  - TransactionalEventListener 설정으로 ReviewService 트랜젝션이 커밋된 후 실행
     *  - Async 설정으로 알림 전송이 시간이 걸려도 댓글 작성 응답 속도 영향 없게 별도의 스레드에서 비동기 처리
     * @param event
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional
    public void handleReviewCreatedEvent(ReviewCreatedEvent event) {
        try {
            // 이벤트에서 ID를 꺼내서 DB에서 직접 조회
            User receiver = userRepository.findById(event.receiverId())
                            .orElseThrow(()-> new BaseException(ErrorCode.USER_NOT_FOUND));

            Board board = boardRepository.findById(event.boardId())
                            .orElseThrow(()->new BaseException(ErrorCode.BOARD_NOT_FOUND));


            sendNotification(receiver, board);
        }
        catch (Exception e){
            log.error("댓글 알림 전송 실패: targetUser={}, error={}", event.receiverId(), e.getMessage());
        }
    }

    /**
     * event 객체를 받아 댓글 알림을 생성 & Notification Service를 호출함
     */
    private void sendNotification(User receiver, Board board){
        NotificationType notificationType;
        String notificationContent;
        String boardTitle = board.getTitle();

        // 게시판 타입에 따라 알림 메세지 분기 처리
        if(board.getType()== Type.INQUIRY){
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
        notificationService.send(receiver, notificationType, notificationContent);

    }



}
