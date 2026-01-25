package com.missions_back.missions_back.dto;

import com.missions_back.missions_back.model.GradeEnum;
import com.missions_back.missions_back.model.RoleEnum;

public record RegisterUserDto(String email, String password, String username, RoleEnum role, GradeEnum grade) {
    
}
