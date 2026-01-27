package move.dto.request;

import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * floor 퇴장 요청 DTO.
 */
@Getter
@NoArgsConstructor
public class MoveExitRequest {

    // 퇴장할 floor ID
    private UUID floorId;
}
