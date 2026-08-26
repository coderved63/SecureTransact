package com.securetransact.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @NotBlank
    @Size(max = 50, message = "First name must be at most 50 characters")
    private String firstName;

    @NotBlank
    @Size(max = 50, message = "Last name must be at most 50 characters")
    private String lastName;
}
