package com.liverary.backend.book.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum SourceType {

    API("API 등록"), USER("USER 등록");

    private final String description;
}
