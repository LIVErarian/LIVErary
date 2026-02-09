package com.liverary.backend.ranking.service;

import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.ranking.domain.RankingType;
import com.liverary.backend.ranking.dto.response.RankingListResponse;
import com.liverary.backend.ranking.dto.response.RankingResponse;
import com.liverary.backend.user.domain.ReadingLog;
import com.liverary.backend.user.domain.User;
import com.liverary.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RankingService {

    private final StringRedisTemplate redisTemplate;
    private final UserRepository userRepository;

    private static final String KEY_PREFIX = "ranking:";

    /**
     * 독서 시간 랭킹 반영
     * 사용자 독서시간 일간, 주간, 월간 각각 누적하고 만료기간 설정
     *
     * @param userId  독서시간 기록할 사용자 UUID
     * @param minutes 추가할 독서 시간
     */
    @Transactional
    public void updateRanking(UUID userId, long minutes) {
        updateRanking(userId, minutes, LocalDate.now());
    }

    /**
     * 특정 날짜 기준으로 랭킹 업데이트 (복구용)
     * 
     * @param userId    독서시간 기록할 사용자 UUID
     * @param minutes   추가할 독서 시간
     * @param date      랭킹 업데이트할 날짜
     */
    @Transactional
    public void updateRanking(UUID userId, long minutes, LocalDate date) {
        String userIdStr = userId.toString();

        // 일간 (3일 보관)
        String dailyKey = getDailyKey(date);
        redisTemplate.opsForZSet().incrementScore(dailyKey, userIdStr, minutes);
        redisTemplate.expire(dailyKey, 3, TimeUnit.DAYS);

        // 주간 (14일 보관)
        String weeklyKey = getWeeklyKey(date);
        redisTemplate.opsForZSet().incrementScore(weeklyKey, userIdStr, minutes);
        redisTemplate.expire(weeklyKey, 14, TimeUnit.DAYS);

        // 월간 (40일 보관)
        String monthlyKey = getMonthlyKey(date);
        redisTemplate.opsForZSet().incrementScore(monthlyKey, userIdStr, minutes);
        redisTemplate.expire(monthlyKey, 40, TimeUnit.DAYS);
    }

    /**
     * DB의 ReadingLog를 기반으로 Redis 랭킹 데이터 복구
     * 
     * @param logs  복구할 ReadingLog 목록
     */
    @Transactional
    public void restoreRankings(List<ReadingLog> logs) {
        for (ReadingLog log : logs) {
            UUID userId = log.getUser().getUserId();
            long minutes = log.getMinutes();
            LocalDate date = log.getCreatedAt().toLocalDate();
            updateRanking(userId, minutes, date);
        }
    }

    /**
     * 오늘의 독서 시간 조회 (분 단위)
     *
     * @param userId 사용자 ID
     * @return 오늘의 총 독서 시간(분), 기록이 없으면 0
     */
    public Long getTodayReadingTime(UUID userId) {
        String dailyKey = getDailyKey(LocalDate.now());
        Double score = redisTemplate.opsForZSet().score(dailyKey, userId.toString());
        return score != null ? score.longValue() : 0L;
    }

    /**
     * 랭킹 정보 조회 (내 순위 + 상위 10명)
     * 지정된 타입에 따라 상위 10명의 사용자 목록, 개인 순위 반환
     *
     * @param userId 랭킹 조회하는 사용자 UUID
     * @param type   조회할 랭킹 타입
     * @return 내 랭킹 정보와 Top 10 리스트가 담긴 응답 객체
     */
    @Transactional(readOnly = true)
    public RankingListResponse getRanking(UUID userId, RankingType type) {
        LocalDate now = LocalDate.now();

        // 요청된 랭킹 타입에 따라 Redis Key 조회
        String key = switch (type) {
            case DAILY -> getDailyKey(now);
            case WEEKLY -> getWeeklyKey(now);
            case MONTHLY -> getMonthlyKey(now);
        };

        // Top 10 조회
        Set<ZSetOperations.TypedTuple<String>> top10Tuples = redisTemplate.opsForZSet().reverseRangeWithScores(key, 0,
                9);

        // 내 랭킹 조회
        Long myRank = redisTemplate.opsForZSet().reverseRank(key, userId.toString());
        Double myTime = redisTemplate.opsForZSet().score(key, userId.toString());

        // 유저 정보 조회 (Top 10 + 나)
        // Set으로 중복된 ID 없도록 처리
        Set<UUID> userIds = new HashSet<>();
        userIds.add(userId); // 내 ID 추가

        if (top10Tuples != null) {
            for (ZSetOperations.TypedTuple<String> t : top10Tuples) {
                if (t.getValue() != null) {
                    userIds.add(UUID.fromString(t.getValue()));
                }
            }
        }

        // 수집한 ID 목록으로 DB에서 유저 정보 일괄 조회
        // Map<UserId, User> 형태로 변환하여 빠른 조회
        Map<UUID, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getUserId, u -> u));

        // 내 랭킹 DTO 생성
        User me = userMap.get(userId);
        if (me == null)
            throw new BaseException(ErrorCode.USER_NOT_FOUND);

        RankingResponse myRankingResponse;
        if (myRank != null && myTime != null) {
            // 랭킹 0부터 시작함 -> +1 처리
            // Redis의 Sorted Set(ZSet) 구조상 Score는 무조건 실수형(Double)으로만 저장
            // 따라서 double 타입의 시간을 long으로 변환
            myRankingResponse = RankingResponse.of(myRank.intValue() + 1, me, myTime.longValue());
        } else {
            // 기록이 없는 경우 빈 응답 생성
            myRankingResponse = RankingResponse.empty(me);
        }

        // Top 10 DTO 생성
        List<RankingResponse> top10List = new ArrayList<>();
        if (top10Tuples != null) {
            int rank = 1;
            for (ZSetOperations.TypedTuple<String> tuple : top10Tuples) {
                String tupleUserId = tuple.getValue();
                Double tupleScore = tuple.getScore();
                if (tupleUserId != null && tupleScore != null) {
                    User user = userMap.get(UUID.fromString(tupleUserId));
                    if (user != null) {
                        top10List.add(RankingResponse.of(rank++, user, tupleScore.longValue()));
                    }
                }
            }
        }

        return RankingListResponse.of(myRankingResponse, top10List);
    }

    /**
     * 일간 랭킹 Redis key 생성
     * 포맷: ranking:daily:yyyyMMdd
     *
     * @param date 기준 날짜
     * @return Redis Key
     */
    private String getDailyKey(LocalDate date) {
        return KEY_PREFIX + "daily:" + date.format(DateTimeFormatter.BASIC_ISO_DATE);
    }

    /**
     * 주간 랭킹 Redis key 생성
     * 포맷: ranking:weekly:yyyy-ww
     *
     * @param date 기준 날짜
     * @return Redis Key
     */
    private String getWeeklyKey(LocalDate date) {
        // 월요일 시작 기준 주차 계산
        WeekFields weekFields = WeekFields.ISO;
        int year = date.get(weekFields.weekBasedYear());
        int week = date.get(weekFields.weekOfWeekBasedYear());
        return KEY_PREFIX + "weekly:" + year + "-" + String.format("%02d", week);
    }

    /**
     * 월간 랭킹 Redis key 생성
     * 포맷: ranking:monthly:yyyyMM
     *
     * @param date 기준 날짜
     * @return Redis Key
     */
    private String getMonthlyKey(LocalDate date) {
        return KEY_PREFIX + "monthly:" + date.format(DateTimeFormatter.ofPattern("yyyyMM"));
    }
}