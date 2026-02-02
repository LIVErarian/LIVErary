package com.liverary.backend.friend.service;

import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.friend.domain.Friend;
import com.liverary.backend.friend.domain.FriendStatus;
import com.liverary.backend.friend.dto.response.FriendResponse;
import com.liverary.backend.friend.repository.FriendRepository;
import com.liverary.backend.user.domain.User;
import com.liverary.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

        // 상대방이 나를 차단했는지 확인
        if (friendRepository.existsBySenderAndReceiverAndStatus(receiver, sender, FriendStatus.BLOCKED)) {
            throw new BaseException(ErrorCode.USER_BLOCKED);
        }

        // 이미 친구 요청이 존재하거나 친구 상태인지 확인
        // A->B 요청뿐만 아니라 B->A 요청도 체크
        if (friendRepository.findBySenderAndReceiver(sender, receiver) != null ||
                friendRepository.findBySenderAndReceiver(receiver, sender) != null) {
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

        // 친구 요청 존재 여부 조회
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

        // 친구 요청 존재 여부 조회
        Friend friend = friendRepository.findById(friendId)
                .orElseThrow(() -> new BaseException(ErrorCode.FRIEND_REQUEST_NOT_FOUND));

        // 거절 권한 체크: 나(userId)에게 온 요청(receiver)인지 확인
        if (!friend.getReceiver().getUserId().equals(userId)) {
            throw new BaseException(ErrorCode.NOT_FRIEND_RECEIVER);
        }

        //  DB에서 즉시 삭제 -> 사용자가 재신청할 수 있도록 하기 위함
        friendRepository.delete(friend);
    }

    /**
     * 사용자 차단 -> 차단 당한 사용자는 차단을 한 사용자에게 친구 신청 못함
     *
     * @param userId    차단하는 유저
     * @param blockUserEmail    차단 당하는 유저 이메일
     */
    @Transactional
    public void blockUser(UUID userId, String blockUserEmail) {

        // 차단 하는 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 차단 당하는 사용자 조회
        User blockUser = userRepository.findByEmail(blockUserEmail)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 본인 차단은 불가능
        if (user.equals(blockUser)) {
            throw new BaseException(ErrorCode.CANNOT_BLOCK_SELF);
        }

        // user -> blockUser 관계 있는지 조회
        Friend relation = friendRepository.findBySenderAndReceiver(user, blockUser);

        // user -> blockUser 관계가 없다면 blockUser -> user 관계 있는지 조회
        if (relation == null) {
            relation = friendRepository.findBySenderAndReceiver(blockUser, user);
        }

        // 관계가 존재한다면 상태를 차단으로 변경
        if (relation != null) {
            relation.block(user, blockUser);
        } else {
            Friend newBlock = Friend.builder()
                    .sender(user)
                    .receiver(blockUser)
                    .status(FriendStatus.BLOCKED)
                    .build();

            friendRepository.save(newBlock);
        }
    }

    /**
     * 내 친구 목록 (ACCEPTED)
     *
     * @param userId    조회 요청한 유저 식별자
     * @param pageable  페이징 설정
     * @return  DTO로 변환된 내 친구 목록 페이지
     */
    public Page<FriendResponse> getAcceptedFriends(UUID userId, Pageable pageable) {
        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 친구 목록 리턴
        return friendRepository.findAllFriends(user, FriendStatus.ACCEPTED, pageable)
                .map(friend -> {
                    User friendUser = friend.getSender().getUserId().equals(userId) ? friend.getReceiver() : friend.getSender();
                    return FriendResponse.of(friend, friendUser);
                });
    }

    /**
     * 받은 요청 목록 (PENDING)
     *
     * @param userId    조회 요청한 유저 식별자
     * @param pageable  페이징 설정
     * @return  DTO로 변환된 받은 요청 목록 페이지
     */
    public Page<FriendResponse> getPendingRequests(UUID userId, Pageable pageable) {
        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 요청 목록 리턴
        return friendRepository.findAllByReceiverAndStatusOrderByCreatedAtDesc(user, FriendStatus.PENDING, pageable)
                .map(friend -> FriendResponse.of(friend, friend.getSender()));
    }

    /**
     * 차단 목록 (BLOCKED)
     *
     * @param userId 조회 요청한 유저 식별자
     * @param pageable 페이징 설정
     * @return  DTO로 변환된 차단 목록 페이지
     */
    public Page<FriendResponse> getBlockedFriends(UUID userId, Pageable pageable) {
        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 차단 목록 리턴
        return friendRepository.findAllBySenderAndStatusOrderByUpdatedAtDesc(user, FriendStatus.BLOCKED, pageable)
                .map(friend -> FriendResponse.of(friend, friend.getReceiver()));
    }

}