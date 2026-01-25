package com.missions_back.missions_back.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.missions_back.missions_back.model.Grade;
import com.missions_back.missions_back.model.GradeEnum;
import com.missions_back.missions_back.repository.GradeRepo;

@Service
public class GradeService {
    private final GradeRepo gradeRepo;

    public GradeService(GradeRepo gradeRepo) {
        this.gradeRepo = gradeRepo;
    }

    public Optional<Grade> findByName(GradeEnum name) {
        return gradeRepo.findByName(name);
    }
}
