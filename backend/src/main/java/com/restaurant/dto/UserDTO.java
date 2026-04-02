
package com.restaurant.dto;

import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String nom;
    private String email;
    private String role;
}