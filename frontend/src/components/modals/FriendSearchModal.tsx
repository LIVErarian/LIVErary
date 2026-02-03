import { useState } from 'react';

import { useModalStore } from '@/store/useModalStore';
import { useRequestFriend, useSearchUser } from '@/hooks/queries/useFriend';

import { PixelButton } from '@/components/common/PixelButton';
import { PixelModal } from '@/components/common/PixelModal';

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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="email"
                        placeholder="이메일 검색"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={{
                            flex: 1,
                            padding: '8px',
                            fontSize: '1rem',
                            border: '2px solid #8B4513',
                            borderRadius: '4px',
                            fontFamily: 'inherit',
                        }}
                    />
                    <PixelButton
                        variant="primary"
                        onClick={handleSearch}
                        disabled={isSearching || !email.trim()}
                        style={{ minWidth: '60px' }}
                    >
                        {isSearching ? '...' : '검색'}
                    </PixelButton>
                </div>

                {/* 검색 결과 영역 */}
                {searchResult && (
                    <div
                        style={{
                            padding: '12px',
                            border: '2px dashed #8B4513',
                            borderRadius: '4px',
                            backgroundColor: '#f8f4eec0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'center'
                        }}
                    >
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{searchResult.nickname}</div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>{searchResult.email}</div>

                        <div style={{ marginTop: '8px' }}>
                            {searchResult.relationStatus === 'NONE' && (
                                <PixelButton
                                    variant="success"
                                    onClick={handleRequest}
                                    disabled={isRequesting}
                                >
                                    친구 요청
                                </PixelButton>
                            )}
                            {searchResult.relationStatus === 'FRIEND' && (
                                <span style={{ color: 'green', fontWeight: 'bold' }}>이미 친구입니다</span>
                            )}
                            {searchResult.relationStatus === 'PENDING_SENT' && (
                                <span style={{ color: '#d97706', fontWeight: 'bold' }}>요청 보냄</span>
                            )}
                            {searchResult.relationStatus === 'PENDING_RECEIVED' && (
                                <span style={{ color: '#d97706', fontWeight: 'bold' }}>요청 받음 (친구 목록 확인)</span>
                            )}
                            {searchResult.relationStatus === 'MYSELF' && (
                                <span style={{ color: '#8B4513', fontWeight: 'bold' }}>나 자신입니다</span>
                            )}
                            {searchResult.relationStatus === 'BLOCKED_BY_ME' && (
                                <span style={{ color: 'red', fontWeight: 'bold' }}>차단됨</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </PixelModal>
    );
};
