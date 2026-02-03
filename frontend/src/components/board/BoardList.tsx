import { useState, useEffect } from 'react';
import { useGetBoardList } from '@/hooks/queries/useBoard';
import { useModalStore } from '@/store/useModalStore';
import type { BoardType } from '@/types/board.types';
import { PixelButton } from '../common/PixelButton';
import { PixelInput } from '../common/PixelInput';
import * as styles from './BoardList.css';

export const BoardList = () => {
  const { openModal } = useModalStore();
  const [type, setType] = useState<BoardType>('PROMOTION');
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useGetBoardList({ type, page, size: 5, keyword: searchQuery });

  // 탭 변경 시 페이지는 0으로 초기화하되, 검색어는 유지
  useEffect(() => {
    setPage(0);
  }, [type]);

  const handleSearch = () => {
    setSearchQuery(keyword);
    setPage(0);
  };

  const isNotice = type === 'NOTICE';

  return (
    <div className={styles.container}>
      {/* 검색창 및 글쓰기 버튼 */}
      <div className={styles.toolbar}>
        
        <div>
          <PixelButton onClick={() => openModal('boardCreate')}>✏️ 글쓰기</PixelButton>
        </div>

        {/* 검색 그룹 */}
        <div className={styles.searchGroup}>
          <div className={styles.searchInputWrapper}>
            <PixelInput 
              placeholder="검색어를 입력하세요"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <PixelButton onClick={handleSearch}>🔍</PixelButton>
        </div>
        
      </div>
      
      {/* 상단 헤더: 탭 버튼 */}
      <div className={styles.header}>
        {(['PROMOTION', 'INQUIRY', 'NOTICE'] as BoardType[]).map((tab) => (
          <PixelButton 
            key={tab} 
            onClick={() => setType(tab)}
            className={`${styles.tabButton} ${type === tab ? styles.activeTab : ''}`}
          >
            {tab === 'INQUIRY' ? '❓ 문의' : tab === 'PROMOTION' ? '📣 홍보' : '📢 공지'}
          </PixelButton>
        ))}
      </div>

      {/* 리스트 테이블 */}
      <div className={styles.tableContainer}>
        {/* 테이블 내용 */}
        {isLoading ? <div className={styles.emptyState}>로딩 중...</div> : 
         data?.content.length === 0 ? <div className={styles.emptyState}>등록된 글이 없습니다.</div> : (
          <>
            {data?.content.map((post) => (
              <div 
                key={post.boardId} 
                className={styles.tableRow}
                onClick={() => openModal('boardDetail', { boardId: post.boardId })}
              >
                {!isNotice && (
                  <span className={styles.textCategory}>
                    {type === 'INQUIRY' ? (
                      post.status === 'DONE' 
                        ? <span style={{ color: 'blue' }}>[답변완료]</span> 
                        : <span style={{ color: 'red' }}>[답변대기]</span>
                    ) : ( // PROMOTION
                      post.category || '기타'
                    )}
                  </span>
                )}
                {isNotice && <span />}

                <span className={styles.textTitle}>{post.title}</span>
                
                {!isNotice && <span className={styles.textAuthor}>{post.nickname}</span>}
                {isNotice && <span />}

                <span className={styles.textDate}>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* 페이지네이션 */}
      <div className={styles.pagination}>
        <PixelButton disabled={data?.first} onClick={() => setPage(p => p - 1)}>◀</PixelButton>
        <span className={styles.pageNumber}>{data ? data.pageable.pageNumber + 1 : 1}</span>
        <PixelButton disabled={data?.last} onClick={() => setPage(p => p + 1)}>▶</PixelButton>
      </div>
    </div>
  );
};