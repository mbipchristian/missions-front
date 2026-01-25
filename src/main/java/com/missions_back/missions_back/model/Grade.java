package com.missions_back.missions_back.model;

import java.util.Date;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "grades")
public class Grade {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(nullable = false)
    private Integer id;

    @Column(unique = true, nullable = false)
    @Enumerated(EnumType.STRING)
    private GradeEnum name;

    @Column(nullable = false)
    private String description;

    @CreationTimestamp
    @Column(updatable = false)
    private Date created_at;

    @UpdateTimestamp
    @Column
    private Date updated_at; 

    @Column(nullable = false)
    private Integer frais_interne;

    @Column(nullable = false)
    private Integer frais_externe;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public GradeEnum getName() {
        return name;
    }

    public Grade setName(GradeEnum name) {
        this.name = name;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public Grade setDescription(String description) {
        this.description = description;
        return this;
    }

    public Date getCreated_at() {
        return created_at;
    }

    public void setCreatedAt(Date created_at) {
        this.created_at = created_at;
    }

    public Date getUpdated_at() {
        return updated_at;
    }

    public void setUpdated_at(Date updated_at) {
        this.updated_at = updated_at;
    }

    public Integer getFrais_interne() {
        return frais_interne;
    }

    public Grade setFrais_interne(Integer frais_interne) {
        this.frais_interne = frais_interne;
        return this;
    }

    public Integer getFrais_externe() {
        return frais_externe;
    }

    public Grade setFrais_externe(Integer frais_externe) {
        this.frais_externe = frais_externe;
        return this;
    }

}
