package com.liverary.backend.category.controller;

import com.liverary.backend.category.dto.response.CategoryResponse;
import com.liverary.backend.category.service.CategoryService;
import com.liverary.backend.common.dto.BaseResponse;
import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    private UUID getUserId(UserDetails user) {
        if (user == null) {
            throw new BaseException(ErrorCode.UNAUTHORIZED);
        }
        return UUID.fromString(user.getUsername());
    }

    /**
     * 카테고리 전체 조회 API
     *
     * @param user 인증된 사용자 정보
     * @return 카테고리 목록
     */
    @GetMapping
    public BaseResponse<List<CategoryResponse>> getCategories(
            @AuthenticationPrincipal UserDetails user
    ) {
        getUserId(user);
        List<CategoryResponse> response = categoryService.getCategories();
        return BaseResponse.success(response);
    }
}
