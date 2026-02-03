import { useState } from 'react';

import { useModalStore } from '@/store/useModalStore';
import { useRequestFriend, useSearchUser } from '@/hooks/queries/useFriend';

import { PixelButton } from '@/components/common/PixelButton';
import { PixelModal } from '@/components/common/PixelModal';
import { PixelInput } from '@/components/common/PixelInput';

import * as styles from './FriendSearchModal.css';

export const FriendSearchModal = () => {
    const [email, setEmail] = useState('');
    const { closeModal } = useModalStore();

    const { mutate: searchUser, data: searchResult, isPending: isSearching } = useSearchUser();
    const { mutate: requestFriend, isPending: isRequesting } = useRequestFriend();

    const handleSearch = () => {
        if (!email.trim()) return;
        searchUser({ email });
    };

    const handleRequest = () => {
        if (!searchResult) return;
        requestFriend({ receiverEmail: searchResult.email });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <PixelModal
            isOpen={true}
            onClose={closeModal}
            title="친구 검색"
            width="450px"
        >
            <div className={styles.container}>
                <div className={styles.searchContainer}>
                    <PixelInput
                        type="email"
                        placeholder="이메일 검색"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={styles.searchInput}
                    />
                    <PixelButton
                        variant="primary"
                        onClick={handleSearch}
                        disabled={isSearching || !email.trim()}
                        className={styles.searchButton}
                    >
                        {isSearching ? '...' : '검색'}
                    </PixelButton>
                </div>

                {/* 검색 결과 영역 */}
                {searchResult && (
                    <div className={styles.resultContainer}>
                        <div className={styles.nickname}>{searchResult.nickname}</div>
                        <div className={styles.email}>{searchResult.email}</div>

                        <div className={styles.actionContainer}>
                            {searchResult.relationStatus === 'NONE' && (
                                <PixelButton
                                    variant="primary"
                                    onClick={handleRequest}
                                    disabled={isRequesting}
                                >
                                    친구 요청
                                </PixelButton>
                            )}
                            {searchResult.relationStatus === 'FRIEND' && (
                                <span className={styles.statusFriend}>이미 친구입니다</span>
                            )}
                            {searchResult.relationStatus === 'PENDING_SENT' && (
                                <span className={styles.statusPending}>요청 보냄</span>
                            )}
                            {searchResult.relationStatus === 'PENDING_RECEIVED' && (
                                <span className={styles.statusPending}>요청 받음 (친구 목록 확인)</span>
                            )}
                            {searchResult.relationStatus === 'MYSELF' && (
                                <span className={styles.statusSelf}>나 자신입니다</span>
                            )}
                            {searchResult.relationStatus === 'BLOCKED_BY_ME' && (
                                <span className={styles.statusBlocked}>차단됨</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </PixelModal>
    );
};
