package com.liverary.backend.auth.provider;

import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;

/**
 * JWT 토큰의 생성, 검증 및 인증 객체 조회를 담당하는 Provider 클래스
 */
@Slf4j
@Component
public class JwtProvider {

    // JWT 서명에 사용할 비밀키
    private final SecretKey secretKey;

    // 토큰 발급자 정보
    private final String issuer;

    // Access Token 만료 시간 (초 단위)
    private final Long accessTokenExpTime;

    // 사용자 정보를 조회하기 위한 서비스
    private final UserDetailsService userDetailsService;

    /**
     * JwtProvider 생성자
     * 설정 파일(application.yml)로부터 값을 주입받아 초기화
     *
     * @param key Base64로 인코딩된 비밀키
     * @param issuer 토큰 발급자
     * @param accessTokenExpTime Access Token 만료 시간
     * @param userDetailsService 사용자 정보 서비스
     */
    public JwtProvider(@Value("${jwt.secret-key}") String key,
                       @Value("${jwt.issuer}") String issuer,
                       @Value("${jwt.expiration-time.access}") Long accessTokenExpTime,
                       UserDetailsService userDetailsService) {
        this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(key));
        this.issuer = issuer;
        this.accessTokenExpTime = accessTokenExpTime;
        this.userDetailsService = userDetailsService;
    }

    /**
     * 사용자의 이메일을 기반으로 Access Token 생성
     *
     * @param email 사용자 이메일
     * @return 생성된 Access Token 문자열
     */
    public String createAccessToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuer(issuer)
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plusSeconds(accessTokenExpTime)))
                .signWith(secretKey)
                .compact();
    }

    /**
     * JWT 토큰으로부터 Spring Security 인증 객체 생성
     *
     * @param token JWT 토큰
     * @return 인증 객체
     */
    public Authentication getAuthentication(String token) {
        Claims claims = parseClaims(token);
        UserDetails userDetails = userDetailsService.loadUserByUsername(claims.getSubject());
        return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());
    }

    /**
     * 전달받은 토큰의 유효성 검증
     *
     * @param token 검증할 JWT 토큰
     * @return 유효 여부 (true: 유효함, false: 유효하지 않음)
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.error("만료된 JWT 토큰입니다.");
            throw new BaseException(ErrorCode.TOKEN_EXPIRED);
        } catch (MalformedJwtException | io.jsonwebtoken.security.SignatureException e) {
            log.error("변조되었거나 잘못된 형식의 JWT 토큰입니다.");
            throw new BaseException(ErrorCode.INVALID_TOKEN);
        } catch (UnsupportedJwtException e) {
            log.error("지원되지 않는 JWT 토큰입니다.");
            throw new BaseException(ErrorCode.INVALID_TOKEN);
        } catch (Exception e) {
            log.error("JWT 토큰 검증 중 예상치 못한 오류가 발생했습니다.");
            throw new BaseException(ErrorCode.UNAUTHORIZED);
        }
        return false;
    }

    /**
     * 토큰 내부의 Claims 정보 파싱
     *
     * @param token JWT 토큰
     * @return 파싱된 Claims 객체
     */
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

}
