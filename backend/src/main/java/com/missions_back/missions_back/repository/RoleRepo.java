package com.missions_back.missions_back.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.missions_back.missions_back.model.Role;
import com.missions_back.missions_back.model.RoleEnum;

public interface RoleRepo extends JpaRepository<Role, Integer> {
    Optional<Role> findByName(RoleEnum name);
}
