package com.liverary.backend.common.service;

import com.liverary.backend.exception.BaseException;
import com.liverary.backend.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@Service
public class LocalFileService {

    private final String UPLOAD_DIR = "./uploads/images/";

    public String uploadFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BaseException(ErrorCode.INVALID_INPUT_VALUE);
        }

        try {
            // 디렉토리 생성
            File directory = new File(UPLOAD_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // 파일명 생성 (UUID)
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String savedFilename = UUID.randomUUID().toString() + extension;

            // 파일 저장
            Path path = Paths.get(UPLOAD_DIR + savedFilename);
            Files.write(path, file.getBytes());

            // URL 반환
            return "/images/" + savedFilename;

        } catch (IOException e) {
            log.error("파일 업로드 실패", e);
            throw new BaseException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }
}
