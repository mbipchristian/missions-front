-- 1. Ajouter la colonne sans contrainte NOT NULL
ALTER TABLE IF EXISTS users ADD COLUMN role_id INTEGER;

-- 2. Mettre à jour les enregistrements existants avec une valeur par défaut
-- Remplacez 1 par l'ID du rôle par défaut que vous souhaitez attribuer
UPDATE users SET role_id = 1 WHERE role_id IS NULL;

-- 3. Ajouter la contrainte NOT NULL après avoir mis à jour les données
ALTER TABLE users ALTER COLUMN role_id SET NOT NULL;

-- 4. Si nécessaire, ajouter la contrainte de clé étrangère
ALTER TABLE users ADD CONSTRAINT fk_users_roles 
FOREIGN KEY (role_id) REFERENCES roles(id);

-- POUR LA TABLE GRADE ---------------------------------------------------------

-- Création de la table grades
CREATE TABLE grades (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    frais_interne INTEGER NOT NULL,
    frais_externe INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion des grades par défaut
INSERT INTO grades (name, description, frais_interne, frais_externe) VALUES
('AE', 'Assistant Expert', 300, 450),
('AM', 'Assistant Manager', 350, 500),
('CA', 'Consultant A', 400, 550),
('CB', 'Consultant B', 450, 600),
('CS', 'Consultant Senior', 500, 650),
('SD', 'Senior Director', 550, 700),
('D', 'Director', 600, 750),
('I', 'Intern', 200, 300),
('CT', 'Consultant Trainee', 250, 400),
('DGA', 'Directeur Général Adjoint', 650, 800),
('DG', 'Directeur Général', 700, 850);

-- Ajout de la colonne grade_id dans la table users
ALTER TABLE users ADD COLUMN grade_id INTEGER;

-- Mettre à jour les enregistrements existants avec une valeur par défaut
-- Remplacez 1 par l'ID du grade par défaut que vous souhaitez attribuer
UPDATE users SET grade_id = 1 WHERE grade_id IS NULL;

-- 3. Ajouter la contrainte NOT NULL après avoir mis à jour les données
ALTER TABLE users ALTER COLUMN grade_id SET NOT NULL;

-- Ajout de la contrainte de clé étrangère
ALTER TABLE users 
ADD CONSTRAINT fk_users_grades 
FOREIGN KEY (grade_id) REFERENCES grades(id);