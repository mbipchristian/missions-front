package com.missions_back.missions_back.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.missions_back.missions_back.model.User;

public interface UserRepo extends JpaRepository<User, UUID>{
    Optional<User> findByEmail(String email); 
}
