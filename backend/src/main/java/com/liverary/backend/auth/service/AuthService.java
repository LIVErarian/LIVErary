package com.liverary.backend.auth.service;

import com.liverary.backend.auth.domain.RefreshToken;
import com.liverary.backend.auth.dto.request.LoginRequest;
import com.liverary.backend.auth.dto.request.ResetPasswordRequest;
import com.liverary.backend.auth.dto.request.SignupRequest;
import com.liverary.backend.auth.dto.response.LoginResponse;
import com.liverary.backend.auth.dto.response.RefreshResponse;
import com.liverary.backend.auth.provider.JwtProvider;
import com.liverary.backend.auth.repository.RefreshTokenRepository;
import com.liverary.backend.auth.util.GmailUtil;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import com.liverary.backend.user.domain.User;
import com.liverary.backend.user.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Collections;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * 인증 관련 비즈니스 로직을 처리하고 Spring Security의 사용자 정보를 로드하는 서비스 클래스
 */
@Slf4j
@Service
@Transactional(readOnly = true)
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    // 이메일 전송에 사용
    private final GmailUtil gmailUtil;
    // 서버 이메일
    @Value("${ADMIN_MAIL}")
    private String adminMail;

    // 랜덤 생성기
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final String CHAR_SET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    private final StringRedisTemplate redisTemplate;
    private static final String VERIFY_PREFIX = "verify:";
    private static final String VERIFIED_FLAG = "verified:";

    /**
     * AuthService 생성자
     * 빈 순환 참조(Circular Dependency) 문제를 해결하기 위해 @RequiredArgsConstructor 대신
     * 수동 생성자를 사용하며, @Lazy 어노테이션을 통해 특정 의존성의 주입 시점을 지연시킵니다.
     *
     * @param userRepository 사용자 정보 조회를 위한 리포지토리
     * @param refreshTokenRepository 리프레시 토큰 관리를 위한 리포지토리
     * @param passwordEncoder 비밀번호 암호화 처리를 위한 인코더 (순환 참조 방지를 위해 지연 주입)
     * @param jwtProvider JWT 토큰 생성 및 검증을 위한 프로바이더 (순환 참조 방지를 위해 지연 주입)
     */
    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            @Lazy PasswordEncoder passwordEncoder,
            @Lazy JwtProvider jwtProvider,
            GmailUtil gmailUtil,
            StringRedisTemplate redisTemplate) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtProvider = jwtProvider;
        this.gmailUtil = gmailUtil;
        this.redisTemplate = redisTemplate;
    }

    /**
     * Spring Security 인증 과정에서 사용자 식별자(UUID)를 기반으로 사용자 조회
     *
     * @param subject 사용자 식별자 UUID 문자열
     * @return Spring Security에서 사용하는 UserDetails 객체
     * @throws BaseException 존재하지 않는 사용자일 경우 발생 (ErrorCode.USER_NOT_FOUND)
     */
    @Override
    @NonNull
    public UserDetails loadUserByUsername(@NonNull String subject) {

        UUID userId = UUID.fromString(subject);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        return new org.springframework.security.core.userdetails.User(
                user.getUserId().toString(),
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
     * 이메일 인증 코드 발송
     *
     * @param userEmail 인증코드 발송할 이메일
     */
    @Transactional
    public void sendVerificationCode(String userEmail) {
        // 이메일 중복 확인
        checkEmailDuplication(userEmail);

        // 6자리 랜덤 숫자 생성
        String code = String.format("%06d", SECURE_RANDOM.nextInt(1000000));

        // Redis에 인증 코드 저장 (유효시간 3분)
        redisTemplate.opsForValue().set(VERIFY_PREFIX + userEmail, code, 3, TimeUnit.MINUTES);

        String subject = "[LIVErary] 회원가입 인증 번호 안내";

        String content = "[LIVErary] 회원가입 인증 번호 안내\n\n" +
                "안녕하세요, LIVErary 서비스를 이용해 주셔서 감사합니다.\n" +
                "회원가입을 위한 인증 번호를 아래와 같이 발급해 드립니다.\n\n" +
                "🔢 인증 번호: " + code + "\n\n" +
                "🚨주의 사항\n" +
                "* 인증 번호는 3분간 유효합니다.\n" +
                "* 본인이 요청하지 않은 경우, 고객센터로 문의해 주시기 바랍니다.\n\n" +
                "언제 어디서나 즐거운 독서 모임, LIVErary 드림\n";

        // 메일 발송
        gmailUtil.sendEmail(adminMail, userEmail, subject, content);
    }

    /**
     * 인증 코드 확인
     *
     * @param userEmail 인증코드 수신 이메일
     * @param code  사용자 화면에 입력한 인증 코드
     * @throws BaseException 인증 번호가 만료되었거나 일치하지 않는 경우 예외 발생
     */
    public void confirmVerificationCode(String userEmail, String code) {
        // Redis에 저장된 해당 이메일의 인증코드 조회
        String savedCode = redisTemplate.opsForValue().get(VERIFY_PREFIX + userEmail);

        // 저장된 코드가 없거나 시간 경과한 경우 만료 예외
        if (savedCode == null) {
            throw new BaseException(ErrorCode.VERIFICATION_CODE_EXPIRED);
        }

        // 사용자가 입력한 코드와 저장된 코드가 일치하지 않으면 불일치 예외
        if (!savedCode.equals(code)) {
            throw new BaseException(ErrorCode.VERIFICATION_CODE_MISMATCH);
        }

        // 인증 성공 기존 임시 인증 번호 삭제
        redisTemplate.delete(VERIFY_PREFIX + userEmail);

        // 해당 이메일의 인증 완료 상태 10분간 Redis 기록
        redisTemplate.opsForValue().set(VERIFIED_FLAG + userEmail, "true", 10, TimeUnit.MINUTES);
    }

    /**
     * 회원가입 로직을 수행 (중복 검증, 비밀번호 암호화, 사용자 정보 저장)
     * 최종 가입 전 Redis를 통해 이메일 인증 완료 여부 확인
     *
     * @param request 회원가입 요청 정보 DTO
     */
    @Transactional
    public void signup(SignupRequest request) {
        // 인증 완료 여부 확인
        String isVerified = redisTemplate.opsForValue().get(VERIFIED_FLAG + request.getEmail());
        if (isVerified == null) {
            throw new BaseException(ErrorCode.EMAIL_NOT_VERIFIED);
        }

        // 이메일 중복 검증
        checkEmailDuplication(request.getEmail());

        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // 엔티티 변환
        User user = User.builder()
                .nickname(request.getNickname())
                .email(request.getEmail())
                .password(encodedPassword)
                .build();

        // 저장
        userRepository.save(user);

        // 회원가입 완료시 Redis 인증 완료 플래그 삭제
        redisTemplate.delete(VERIFIED_FLAG + request.getEmail());
    }

    /**
     * 사용자의 이메일과 비밀번호를 검증 후 액세스 토큰 발급
     *
     * @param request 로그인 정보 DTO
     * @return 생성된 액세스 토큰을 포함한 LoginResponse
     * @throws BaseException 사용자가 없거나 비밀번호가 틀린 경우 발생
     */
    @Transactional
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
        String refreshToken = jwtProvider.createRefreshToken(user.getUserId());

        RefreshToken tokenEntity = new RefreshToken(user.getUserId(), refreshToken);
        refreshTokenRepository.save(tokenEntity);

        return LoginResponse.of(accessToken, refreshToken);
    }

    /**
     * 리프레시 토큰을 사용하여 새로운 액세스 토큰을 재발급
     *
     * @param refreshToken 클라이언트로부터 전달받은 리프레시 토큰
     * @return 새롭게 발급된 액세스 토큰을 담은 RefreshResponse DTO
     * @throws BaseException 유효하지 않거나 존재하지 않는 토큰일 경우 발생
     */
    @Transactional
    public RefreshResponse reissue(String refreshToken) {
        // refreshToken 유효성 및 만료 여부 검증
        jwtProvider.validateToken(refreshToken);

        // DB에서 Refresh Token 검색
        RefreshToken savedToken = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new BaseException(ErrorCode.TOKEN_INVALID));

        // 새로운 Access Token 발급
        String newAccessToken = jwtProvider.createAccessToken(savedToken.getUserId());

        return RefreshResponse.of(newAccessToken);
    }

    /**
     * 사용자의 리프레시 토큰을 삭제하여 로그아웃 처리
     *
     * @param userId 사용자의 식별자 (UUID)
     */
    @Transactional
    public void logout(UUID userId) {
        // 해당 유저의 리프레시 토큰이 존재하면 삭제
        refreshTokenRepository.deleteById(userId);
    }

    /**
     * 비밀번호 찾기
     * 임시 비밀번호 생성 및 이메일 발송
     *
     * @param userEmail 임시 비밀번호 전송할 사용자 이메일
     */
    @Transactional
    public void findPassword(String userEmail) {
        // 유저 정보 조회
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 10자리 영문/숫자 혼합 임시 비밀번호 생성
        String tempPassword = generateTempPassword();

        // 비밀번호 암호화 후 DB 업데이트
        user.updatePassword(passwordEncoder.encode(tempPassword));

        String subject = "[LIVErary] 임시 비밀번호 발송 안내";

        String content = "[LIVErary] 임시 비밀번호 발송 안내\n\n" +
                "안녕하세요, LIVErary 서비스를 이용해 주셔서 감사합니다.\n" +
                "요청하신 임시 비밀번호를 아래와 같이 발급해 드립니다.\n\n" +
                "🔑 임시 비밀번호: " + tempPassword + "\n\n" +
                "🚨주의 사항\n" +
                "* 로그인 후 마이페이지에서 꼭 비밀번호를 변경해 주세요!\n" +
                "* 본인이 요청하지 않은 경우, 고객센터로 문의해 주시기 바랍니다.\n\n" +
                "언제 어디서나 즐거운 독서 모임, LIVErary 드림\n";

        // 메일 발송
        gmailUtil.sendEmail(adminMail, userEmail, subject, content);
    }

    /**
     * SecureRandom을 사용하여 예측 불가능한 문자열 생성
     *
     * @return 랜덤으로 생성된 임시 비밀번호
     */
    private String generateTempPassword() {
        StringBuilder sb = new StringBuilder(10);
        for (int i = 0; i < 10; i++) {
            int randomIndex = SECURE_RANDOM.nextInt(CHAR_SET.length());
            sb.append(CHAR_SET.charAt(randomIndex));
        }
        return sb.toString();
    }

    /**
     * 비밀번호 재설정
     *
     * @param userId    사용자 UUID
     * @param request   비밀번호 재설정 요청 정보 DTO
     */
    @Transactional
    public void resetPassword(UUID userId, ResetPasswordRequest request) {
        // 유저 정보 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 현재 DB에 저장된 비밀번호
        String userPassword = user.getPassword();
        // 사용자가 화면에 입력한 기존 비밀번호
        String oldPassword = request.getOldPassword();
        // 사용자가 화면에 입력한 새 비밀번호
        String newPassword = request.getNewPassword();
        // 사용자가 화면에 입력한 확인 비밀번호
        String confirmPassword = request.getConfirmPassword();

        // 기존 비밀번호 일치 여부 확인
        if (!passwordEncoder.matches(oldPassword, userPassword)) {
            throw new BaseException(ErrorCode.PASSWORD_WRONG);
        }

        // 새 비밀번호와 확인 비밀번호 일치 여부 확인
        if (!newPassword.equals(confirmPassword)) {
            throw new BaseException(ErrorCode.PASSWORD_MISMATCH);
        }

        // 새 비밀번호가 기존과 동일한지 확인
        if (oldPassword.equals(newPassword)) {
            throw new BaseException(ErrorCode.SAME_AS_OLD_PASSWORD);
        }

        // 새 비밀번호 암호화 및 업데이트
        user.updatePassword(passwordEncoder.encode(newPassword));
    }

}