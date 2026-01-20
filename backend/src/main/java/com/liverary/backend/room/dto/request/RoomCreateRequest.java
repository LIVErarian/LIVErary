package com.liverary.backend.room.dto.request;

import com.liverary.backend.book.domain.Book;
import com.liverary.backend.category.domain.Category;
import com.liverary.backend.room.domain.AccessType;
import com.liverary.backend.room.domain.Room;
import com.liverary.backend.room.domain.RoomType;
import com.liverary.backend.user.domain.User;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 방 (Room) 생성 요청 정보를 전달하는 DTO 클래스입니다.
 *
 * <p>클라이언트로부터 방 생성에 필요한 제목, 유형, 인원 설정 등을 입력받습니다.
 * 입력값에 대한 기본적인 유효성 검증(Validation)을 수행합니다.</p>
 */
@Getter
@NoArgsConstructor
public class RoomCreateRequest {

    @NotBlank(message = "방 제목은 필수입니다.")
    private String title;

    @NotNull(message = "방 유형은 필수입니다.")
    private RoomType roomType;

    @NotNull(message = "공개 여부는 필수입니다.")
    private AccessType accessType;

    @NotNull(message = "최대 인원은 필수입니다.")
    @Min(value = 1, message = "최소 인원은 1명입니다.")
    @Max(value = 16, message = "최대 인원은 16명입니다.")
    private Integer maxUser;

    private UUID bookId;
    private UUID categoryId;

    private LocalDateTime startAt;

    /**
     * DTO를 Room 엔티티로 변환합니다.
     *
     * @param creator  방을 생성한 유저(User) 엔티티
     * @param book     선택된 책(Book) 엔티티 (없으면 null)
     * @param category 결정된 카테고리(Category) 엔티티
     * @return 생성된 Room 엔티티 객체
     */
    public Room toEntity(User creator, Book book, Category category) {
        return Room.builder()
                .title(this.title)
                .roomType(this.roomType)
                .accessType(this.accessType)
                .maxUser(this.maxUser)
                .startAt(this.startAt)
                .creator(creator)
                .book(book)
                .category(category)
                .build();
    }
}
