package com.missions_back.missions_back.service;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.missions_back.missions_back.dto.RegisterUserDto;
import com.missions_back.missions_back.model.Grade;
import com.missions_back.missions_back.model.GradeEnum;
import com.missions_back.missions_back.model.Role;
import com.missions_back.missions_back.model.RoleEnum;
import com.missions_back.missions_back.model.User;
import com.missions_back.missions_back.repository.UserRepo;

import jakarta.annotation.PostConstruct;

@Service
public class UserService {
    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final RoleService roleService;
    private final GradeService gradeService;

    public UserService(UserRepo userRepo, PasswordEncoder passwordEncoder, RoleService roleService, GradeService gradeService) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.roleService = roleService;
        this.gradeService = gradeService;
    }

    @PostConstruct
    void init(){
        RegisterUserDto userDto = new RegisterUserDto("admin@email.com","123456","Admin", RoleEnum.ADMIN, GradeEnum.CS);

        Optional<Role> optionalRole = roleService.findByName(RoleEnum.ADMIN);
        Optional<User> optionalUser = userRepo.findByEmail(userDto.email());
        Optional<Grade> optionalGrade = gradeService.findByName(GradeEnum.CS);

        if (optionalRole.isEmpty() || optionalUser.isPresent() || optionalGrade.isEmpty()) {
            System.out.println("Admin user already exists or role/grade not found");
            return;
        }

        var user = new User()
                .setName(userDto.username())
                .setEmail(userDto.email())
                .setPassword(passwordEncoder.encode(userDto.password()))
                .setRole(optionalRole.get())
                .setGrade(optionalGrade.get());

        userRepo.save(user);
    }

    public List <User> getAllUsers() {
        return userRepo.findAll();
    }
}
