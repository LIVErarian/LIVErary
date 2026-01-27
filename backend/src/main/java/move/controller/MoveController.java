package move.controller;

import java.security.Principal;
import java.util.UUID;

import lombok.RequiredArgsConstructor;
import move.dto.request.MoveEnterRequest;
import move.dto.request.MoveExitRequest;
import move.dto.request.MoveRequest;
import move.service.MoveService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class MoveController {

    private final MoveService moveService;

    /**
     * 사용자의 이동 입력을 수신해 floor 큐에 적재한다.
     *
     * @param request   이동 입력 DTO
     * @param principal 인증된 사용자 Principal
     */
    @MessageMapping("/move")
    public void move(MoveRequest request, Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        moveService.enqueue(userId, request);
    }

    /**
     * floor 입장을 처리한다.
     *
     * @param request   floor 입장 DTO
     * @param principal 인증된 사용자 Principal
     */
    @MessageMapping("/move/enter")
    public void enterFloor(MoveEnterRequest request, Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        moveService.touch(userId, request);
    }

    /**
     * floor 퇴장을 처리한다.
     *
     * @param request   floor 퇴장 DTO
     * @param principal 인증된 사용자 Principal
     */
    @MessageMapping("/move/exit")
    public void exitFloor(MoveExitRequest request, Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        moveService.removeFromFloor(userId, request.getFloorId());
    }

}
