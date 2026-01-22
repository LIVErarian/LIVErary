package com.liverary.backend.auth.config;

import com.liverary.backend.auth.filter.JwtAuthenticationFilter;
import com.liverary.backend.auth.filter.JwtExceptionFilter;
import com.liverary.backend.auth.provider.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import tools.jackson.databind.ObjectMapper;

/**
 * Spring Security의 전반적인 보안 정책을 설정하는 설정 클래스
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtProvider jwtProvider;

    /**
     * 보안 필터 체인을 정의하고 HTTP 보안 설정 구성
     * Stateless API 방식에 최적화됨
     *
     * @param http HttpSecurity 객체
     * @return 구성된 SecurityFilterChain 객체
     * @throws Exception 설정 과정에서 오류 발생 시
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // CSRF 비활성화 및 세션 정책 Stateless로 설정
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 요청별 권한 제어 설정
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                // 로그인, 회원가입 등 인증 관련 API 허용
                                "/auth/**",
                                // 도서 목록 조회 및 검색 API 허용
                                "/book/**",

                                // Swagger 관련 api 허용
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()
                        .anyRequest().authenticated()
                )

                // JWT 인증 필터를 UsernamePasswordAuthenticationFilter 이전에 실행되도록 설정
                .addFilterBefore(new JwtAuthenticationFilter(jwtProvider), UsernamePasswordAuthenticationFilter.class)

                // JWT 예외 처리 필터를 인증 필터 바로 앞에 등록하여 예외를 가로채도록 설정
                .addFilterBefore(new JwtExceptionFilter(new ObjectMapper()), JwtAuthenticationFilter.class);

        return http.build();
    }

    /**
     * 비밀번호를 안전하게 암호화하기 위한 빈 등록 (BCrypt 해싱 알고리즘 사용)
     *
     * @return BCryptPasswordEncoder 객체
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}
