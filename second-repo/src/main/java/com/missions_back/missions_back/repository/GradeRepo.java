package com.missions_back.missions_back.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.missions_back.missions_back.model.Grade;
import com.missions_back.missions_back.model.GradeEnum;

public interface GradeRepo extends JpaRepository<Grade, Integer> {
    Optional <Grade> findByName(GradeEnum name);
}
