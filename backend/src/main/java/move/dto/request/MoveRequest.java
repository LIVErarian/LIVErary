package move.dto.request;

import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 사용자의 이동 입력을 전달하는 요청 DTO.
 */
@Getter
@NoArgsConstructor
public class MoveRequest {

    // 이동이 발생한 floor ID
    private UUID floorId;

    // 현재 위치
    private double x;
    private double y;

    // 클라이언트 기준 입력 시각 (epoch millis)
    private long clientTs;
}
