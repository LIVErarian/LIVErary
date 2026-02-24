package com.liverary.backend.user.domain;

import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Embeddable
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Character {

    private String bodyColor;
    private String pantsColor;
    private String shirtColor;
    private String hairColor;

    public static Character createDefault() {
        return new Character("#FFFFFF", "#010101", "#1D592D", "#FFFFFF");
    }
}
