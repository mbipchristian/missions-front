package com.missions_back.missions_back.service;

import java.util.Optional;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.missions_back.missions_back.dto.LoginUserDto;
import com.missions_back.missions_back.dto.RegisterUserDto;
import com.missions_back.missions_back.model.Grade;
import com.missions_back.missions_back.model.Role;
import com.missions_back.missions_back.model.User;
import com.missions_back.missions_back.repository.UserRepo;

@Service
public class AuthService {
    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final RoleService roleService;
    private final GradeService gradeService;


    public AuthService(UserRepo userRepo, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, RoleService roleService, GradeService gradeService) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.roleService = roleService;
        this.gradeService = gradeService;
    }

    public User signup(RegisterUserDto input) {

        Optional<Role> optionalRole = roleService.findByName(input.role());
        Optional<Grade> optionalGrade = gradeService.findByName(input.grade());

        if (optionalRole.isEmpty() || optionalGrade.isEmpty()) {
            return null;
        }

        var user = new User()
                .setName(input.username())
                .setEmail(input.email())
                .setPassword(passwordEncoder.encode(input.password()))
                .setRole(optionalRole.get())
                .setGrade(optionalGrade.get());
        return userRepo.save(user);
    }

    public UserDetails authenticate(LoginUserDto input) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(input.email(), input.password())
        );
        return userRepo.findByEmail(input.email())
        .orElseThrow();
    }
}
