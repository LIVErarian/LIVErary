package com.liverary.backend.config;

import java.security.Principal;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * STOMP에서 사용할 Principal 구현체.
 */
@Getter
@AllArgsConstructor
public class StompPrincipal implements Principal {
    // Principal 이름(사용자 식별자)
    private final String name;
}
