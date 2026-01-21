package com.liverary.backend.auth.service;

import com.liverary.backend.auth.dto.request.LoginRequest;
import com.liverary.backend.auth.dto.request.SignupRequest;
import com.liverary.backend.auth.dto.response.LoginResponse;
import com.liverary.backend.auth.provider.JwtProvider;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.user.domain.Role;
import com.liverary.backend.user.domain.User;
import com.liverary.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.UUID;

/**
 * 인증 관련 비즈니스 로직을 처리하고 Spring Security의 사용자 정보를 로드하는 서비스 클래스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    /**
     * Spring Security 인증 과정에서 사용자 식별자(UUID)를 기반으로 사용자 조회
     *
     * @param subject 사용자 식별자 UUID 문자열
     * @return Spring Security에서 사용하는 UserDetails 객체
     * @throws BaseException 존재하지 않는 사용자일 경우 발생 (ErrorCode.USER_NOT_FOUND)
     */
    @Override
    public UserDetails loadUserByUsername(String subject) {

        UUID userId = UUID.fromString(subject);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }

    /**
     * 입력받은 이메일의 중복 여부를 검증
     *
     * @param email 중복 확인을 진행할 이메일 주소
     * @throws BaseException 이미 가입된 이메일일 경우 DUPLICATE_EMAIL 예외 발생
     */
    public void checkEmailDuplication(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new BaseException(ErrorCode.EMAIL_DUPLICATE);
        }
    }

    /**
     * 회원가입 로직을 수행 (중복 검증, 비밀번호 암호화, 사용자 정보 저장)
     *
     * @param request 회원가입 요청 정보 DTO
     */
    @Transactional
    public void signup(SignupRequest request) {

        // 이메일 중복 검증
        checkEmailDuplication(request.getEmail());

        // 비밀번호 암호화 및 엔티티 변환
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        User user = User.builder()
                .nickname(request.getNickname())
                .email(request.getEmail())
                .password(encodedPassword)
                .gender(request.getGender())
                .build();

        // 저장
        userRepository.save(user);
    }

    /**
     * 사용자의 이메일과 비밀번호를 검증 후 액세스 토큰 발급
     *
     * @param request 로그인 정보 DTO
     * @return 생성된 액세스 토큰을 포함한 LoginResponse
     * @throws BaseException 사용자가 없거나 비밀번호가 틀린 경우 발생
     */
    public LoginResponse login(LoginRequest request) {

        // 이메일 존재 확인
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 비밀번호 일치 여부 확인
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BaseException(ErrorCode.PASSWORD_INVALID);
        }

        // 토큰 생성
        String accessToken = jwtProvider.createAccessToken(user.getUserId());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .build();
    }

}