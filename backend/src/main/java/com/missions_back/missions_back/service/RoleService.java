package com.missions_back.missions_back.service;


import java.util.Optional;

import org.springframework.stereotype.Service;

import com.missions_back.missions_back.model.Role;
import com.missions_back.missions_back.model.RoleEnum;
import com.missions_back.missions_back.repository.RoleRepo;


@Service
public class RoleService {

    private final RoleRepo roleRepo;

    public RoleService(RoleRepo roleRepo) {
        this.roleRepo = roleRepo;
    }


    public Optional<Role> findByName(RoleEnum name) {
        return roleRepo.findByName(name);
    }
}
