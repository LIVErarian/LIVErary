package com.liverary.backend.quote.repository;

import com.liverary.backend.quote.domain.Quote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

/**
 * Quote 엔티티에 대한 데이터베이스 접근 기능을 담당하는 Repository 인터페이스입니다.
 */
public interface QuoteRepository extends JpaRepository<Quote, Long> {

    /**
     * 데이터베이스에 저장된 명언 중 랜덤한 하나를 조회합니다.
     *
     * <p>RAND() 함수를 사용하여 무작위로 선택된 명언을 반환합니다.
     * 주로 홈 화면이나 초대 화면에서 일일 명언 표시 용도로 사용됩니다.</p>
     *
     * @return 무작위로 선택된 Quote 객체를 Optional로 감싼 결과
     */
    @Query(value = "SELECT * FROM quote ORDER BY RAND() LIMIT 1", nativeQuery = true)
    Optional<Quote> findRandom();
}