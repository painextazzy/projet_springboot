package com.restaurant.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TableDTO {
    private Long id;
    private String nom;
    private Integer capacite;
    private String status;
}