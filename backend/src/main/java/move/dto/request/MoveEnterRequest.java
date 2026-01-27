package move.dto.request;

import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * floor 입장 요청 DTO.
 */
@Getter
@NoArgsConstructor
public class MoveEnterRequest {

    // 입장할 floor ID
    private UUID floorId;

    // 현재 위치 x 좌표
    private Double x;

    // 현재 위치 y 좌표
    private Double y;
}
