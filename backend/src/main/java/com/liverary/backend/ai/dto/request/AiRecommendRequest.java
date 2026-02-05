package com.liverary.backend.ai.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiRecommendRequest {
    // 유저 선호 카테고리
    @JsonProperty("categories")
    private List<String> categories;

    // 읽은 책
    @JsonProperty("read_books")
    private List<BookInfo> readBooks;

    // 찜한 책
    @JsonProperty("liked_books")
    private List<BookInfo> likedBooks;

    // 방 참여 히스토리
    @JsonProperty("room_history")
    private List<HistoryInfo> roomHistory;

    // 추천 후보 방 목록
    @JsonProperty("room_list")
    private List<RoomInfo> roomList;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BookInfo {

        @JsonProperty("category")
        private String category;

        @JsonProperty("title")
        private String title;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HistoryInfo {

        @JsonProperty("category")
        private String category;

        @JsonProperty("title")
        private String title;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RoomInfo {

        @JsonProperty("room_id")
        private UUID roomId;

        @JsonProperty("category")
        private String category;

        @JsonProperty("title")
        private String title;

        @JsonProperty("book_title")
        private String bookTitle;

        @JsonProperty("book_category")
        private String bookCategory;
    }
}
