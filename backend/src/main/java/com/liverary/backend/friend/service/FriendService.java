package com.liverary.backend.friend.service;

import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.friend.domain.Friend;
import com.liverary.backend.friend.repository.FriendRepository;
import com.liverary.backend.user.domain.User;
import com.liverary.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FriendService {

    private final FriendRepository friendRepository;
    private final UserRepository userRepository;

    /**
     * 친구 요청 보내기
     * 본인 요청 여부 및 이미 존재하는 관계인지 확인 후 저장
     *
     * @param senderId  친구 요청을 보내는 사용자 아이디
     * @param receiverEmail 친구 요청을 보낼 이메일
     */
    @Transactional
    public void sendFriendRequest(UUID senderId, String receiverEmail) {

        // 보내는 사람이 유저인지 조회
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 받는 사람이 유저인지 조회
        User receiver = userRepository.findByEmail(receiverEmail)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 본인에게 요청하는지 검증
        if (sender.equals(receiver)) {
            throw new BaseException(ErrorCode.CANNOT_FRIEND_SELF);
        }

        // 이미 친구 요청이 존재하거나 친구 상태인지 확인
        // A->B 요청뿐만 아니라 B->A 요청도 체크
        if (friendRepository.existsBySenderAndReceiver(sender, receiver) ||
                friendRepository.existsBySenderAndReceiver(receiver, sender)) {
            throw new BaseException(ErrorCode.ALREADY_FRIEND_REQUEST);
        }

        Friend friend = Friend.builder()
                .sender(sender)
                .receiver(receiver)
                .build();

        friendRepository.save(friend);
    }

    /**
     * 친구 요청 수락
     *
     * @param friendId  수락할 친구 요청 UUID
     * @param userId    사용자 UUID
     */
    @Transactional
    public void acceptFriendRequest(UUID friendId, UUID userId) {
        Friend friend = friendRepository.findById(friendId)
                .orElseThrow(() -> new BaseException(ErrorCode.FRIEND_REQUEST_NOT_FOUND));

        // 수락 권한 체크: 나(userId)에게 온 요청(receiver)인지 확인
        if (!friend.getReceiver().getUserId().equals(userId)) {
            throw new BaseException(ErrorCode.NOT_FRIEND_RECEIVER);
        }

        // 요청 상태 수락으로 변경
        friend.accept();
    }

    /**
     * 친구 요청 거절
     *
     * @param friendId  거절할 친구 요청 UUID
     * @param userId    사용자 UUID
     */
    @Transactional
    public void rejectFriendRequest(UUID friendId, UUID userId) {
        //
        Friend friend = friendRepository.findById(friendId)
                .orElseThrow(() -> new BaseException(ErrorCode.FRIEND_REQUEST_NOT_FOUND));

        // 거절 권한 체크: 나(userId)에게 온 요청(receiver)인지 확인
        if (!friend.getReceiver().getUserId().equals(userId)) {
            throw new BaseException(ErrorCode.NOT_FRIEND_RECEIVER);
        }

        // 요청 상태 거절로 변경
        friend.reject();
    }

}