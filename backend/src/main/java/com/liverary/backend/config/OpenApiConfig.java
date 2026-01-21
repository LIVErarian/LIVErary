package com.liverary.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI 문서 메타데이터를 구성한다.
 */
@Configuration
public class OpenApiConfig {

    /**
     * 서비스 정보를 포함한 OpenAPI 스펙 객체를 생성한다.
     *
     * @return OpenAPI 스펙 인스턴스
     */
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Liverary API")
                        .description("Liverary 서비스 API 문서")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("Liverary Team")
                        )
                );
    }
}
