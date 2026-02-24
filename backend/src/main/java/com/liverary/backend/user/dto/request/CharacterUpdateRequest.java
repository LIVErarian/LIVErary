package com.liverary.backend.user.dto.request;

import com.liverary.backend.user.domain.Character;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CharacterUpdateRequest {

    @NotBlank(message = "bodyColor는 필수입니다.")
    private String bodyColor;

    @NotBlank(message = "pantsColor는 필수입니다.")
    private String pantsColor;

    @NotBlank(message = "shirtColor는 필수입니다.")
    private String shirtColor;

    @NotBlank(message = "hairColor는 필수입니다.")
    private String hairColor;

    public Character toEntity() {
        return new Character(bodyColor, pantsColor, shirtColor, hairColor);
    }
}
