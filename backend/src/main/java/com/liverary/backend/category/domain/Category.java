package com.liverary.backend.category.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Table (name = "CATEGORY")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {
    @Id
    @Column(name = "category_id", length = 36)
    @GeneratedValue(strategy = GenerationType.UUID)
    private String categoryId;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

}
