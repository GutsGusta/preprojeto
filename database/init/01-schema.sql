-- JobMatch | MySQL 8.0+
-- Banco de dados relacional para plataforma de vagas e candidaturas
CREATE DATABASE IF NOT EXISTS jobmatch CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE jobmatch;

CREATE TABLE usuario (
  id_usuario INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  perfil ENUM('CANDIDATO','RECRUTADOR','ADMIN') NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE empresa (
  id_empresa INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  razao_social VARCHAR(200) NOT NULL,
  nome_fantasia VARCHAR(200) NOT NULL,
  cnpj CHAR(14) NOT NULL UNIQUE,
  setor VARCHAR(100),
  descricao TEXT,
  site VARCHAR(500),
  logo_url VARCHAR(500),
  cidade VARCHAR(100) NOT NULL,
  uf CHAR(2) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE candidato (
  id_candidato INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL UNIQUE,
  nome VARCHAR(150) NOT NULL,
  cpf CHAR(11) NOT NULL UNIQUE,
  data_nascimento DATE,
  telefone VARCHAR(20),
  cidade VARCHAR(100),
  uf CHAR(2),
  foto_url VARCHAR(500),
  CONSTRAINT fk_candidato_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE recrutador (
  id_recrutador INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL UNIQUE,
  empresa_id INT UNSIGNED NOT NULL,
  nome VARCHAR(150) NOT NULL,
  cargo VARCHAR(100),
  admin_empresa BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_recrutador_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario),
  CONSTRAINT fk_recrutador_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id_empresa)
) ENGINE=InnoDB;

CREATE TABLE curriculo (
  id_curriculo INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  candidato_id INT UNSIGNED NOT NULL UNIQUE,
  resumo TEXT,
  pretensao_salarial DECIMAL(10,2),
  arquivo_pdf_url VARCHAR(500),
  percentual_preenchido TINYINT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT chk_curriculo_percentual CHECK (percentual_preenchido BETWEEN 0 AND 100),
  CONSTRAINT fk_curriculo_candidato FOREIGN KEY (candidato_id) REFERENCES candidato(id_candidato)
) ENGINE=InnoDB;

CREATE TABLE formacao (
  id_formacao INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  curriculo_id INT UNSIGNED NOT NULL,
  instituicao VARCHAR(200) NOT NULL,
  curso VARCHAR(150) NOT NULL,
  nivel VARCHAR(50),
  inicio DATE,
  fim DATE,
  CONSTRAINT chk_formacao_periodo CHECK (fim IS NULL OR inicio IS NULL OR fim >= inicio),
  CONSTRAINT fk_formacao_curriculo FOREIGN KEY (curriculo_id) REFERENCES curriculo(id_curriculo)
) ENGINE=InnoDB;

CREATE TABLE experiencia (
  id_experiencia INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  curriculo_id INT UNSIGNED NOT NULL,
  empresa VARCHAR(200) NOT NULL,
  cargo VARCHAR(150) NOT NULL,
  descricao TEXT,
  inicio DATE,
  fim DATE,
  atual BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT chk_experiencia_periodo CHECK (fim IS NULL OR inicio IS NULL OR fim >= inicio),
  CONSTRAINT fk_experiencia_curriculo FOREIGN KEY (curriculo_id) REFERENCES curriculo(id_curriculo)
) ENGINE=InnoDB;

CREATE TABLE habilidade (
  id_habilidade INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE curriculo_habilidade (
  curriculo_id INT UNSIGNED NOT NULL,
  habilidade_id INT UNSIGNED NOT NULL,
  nivel ENUM('BASICO','INTERMEDIARIO','AVANCADO') DEFAULT NULL,
  PRIMARY KEY (curriculo_id, habilidade_id),
  CONSTRAINT fk_ch_curriculo FOREIGN KEY (curriculo_id) REFERENCES curriculo(id_curriculo) ON DELETE CASCADE,
  CONSTRAINT fk_ch_habilidade FOREIGN KEY (habilidade_id) REFERENCES habilidade(id_habilidade)
) ENGINE=InnoDB;

CREATE TABLE vaga (
  id_vaga INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  empresa_id INT UNSIGNED NOT NULL,
  recrutador_id INT UNSIGNED NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT NOT NULL,
  area VARCHAR(100),
  nivel VARCHAR(50),
  modalidade ENUM('PRESENCIAL','HIBRIDO','REMOTO') NOT NULL,
  tipo_contrato VARCHAR(30) NOT NULL,
  cidade VARCHAR(100),
  uf CHAR(2),
  salario_min DECIMAL(10,2),
  salario_max DECIMAL(10,2),
  status ENUM('RASCUNHO','PUBLICADA','PAUSADA','ENCERRADA') NOT NULL DEFAULT 'RASCUNHO',
  publicada_em DATETIME,
  encerrada_em DATETIME,
  CONSTRAINT chk_vaga_salarios CHECK (salario_min IS NULL OR salario_max IS NULL OR salario_min <= salario_max),
  CONSTRAINT fk_vaga_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id_empresa),
  CONSTRAINT fk_vaga_recrutador FOREIGN KEY (recrutador_id) REFERENCES recrutador(id_recrutador)
) ENGINE=InnoDB;

CREATE TABLE vaga_habilidade (
  vaga_id INT UNSIGNED NOT NULL,
  habilidade_id INT UNSIGNED NOT NULL,
  obrigatoria BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (vaga_id, habilidade_id),
  CONSTRAINT fk_vh_vaga FOREIGN KEY (vaga_id) REFERENCES vaga(id_vaga) ON DELETE CASCADE,
  CONSTRAINT fk_vh_habilidade FOREIGN KEY (habilidade_id) REFERENCES habilidade(id_habilidade)
) ENGINE=InnoDB;

CREATE TABLE etapa_vaga (
  id_etapa INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  vaga_id INT UNSIGNED NOT NULL,
  nome VARCHAR(100) NOT NULL,
  ordem INT UNSIGNED NOT NULL,
  descricao TEXT,
  UNIQUE KEY uq_etapa_vaga_ordem (vaga_id, ordem),
  UNIQUE KEY uq_etapa_vaga_id (vaga_id, id_etapa),
  CONSTRAINT fk_etapa_vaga FOREIGN KEY (vaga_id) REFERENCES vaga(id_vaga)
) ENGINE=InnoDB;

CREATE TABLE candidatura (
  id_candidatura INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  candidato_id INT UNSIGNED NOT NULL,
  vaga_id INT UNSIGNED NOT NULL,
  etapa_atual_id INT UNSIGNED NULL,
  status ENUM('ENVIADA','EM_ANALISE','ENTREVISTA','REPROVADA','APROVADA','DESISTENCIA') NOT NULL DEFAULT 'ENVIADA',
  carta_apresentacao TEXT,
  curriculo_snapshot JSON,
  criada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_candidatura_candidato_vaga (candidato_id, vaga_id),
  CONSTRAINT fk_candidatura_candidato FOREIGN KEY (candidato_id) REFERENCES candidato(id_candidato),
  CONSTRAINT fk_candidatura_vaga FOREIGN KEY (vaga_id) REFERENCES vaga(id_vaga),
  CONSTRAINT fk_candidatura_etapa_mesma_vaga FOREIGN KEY (vaga_id, etapa_atual_id) REFERENCES etapa_vaga(vaga_id, id_etapa)
) ENGINE=InnoDB;

CREATE TABLE historico_candidatura (
  id_historico INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  candidatura_id INT UNSIGNED NOT NULL,
  etapa_id INT UNSIGNED NULL,
  autor_usuario_id INT UNSIGNED NOT NULL,
  status VARCHAR(30) NOT NULL,
  feedback TEXT,
  motivo_reprovacao TEXT,
  data_alteracao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_historico_candidatura FOREIGN KEY (candidatura_id) REFERENCES candidatura(id_candidatura),
  CONSTRAINT fk_historico_etapa FOREIGN KEY (etapa_id) REFERENCES etapa_vaga(id_etapa),
  CONSTRAINT fk_historico_autor FOREIGN KEY (autor_usuario_id) REFERENCES usuario(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE favorito_vaga (
  id_favorito_vaga INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  vaga_id INT UNSIGNED NOT NULL,
  UNIQUE KEY uq_favorito_vaga (usuario_id, vaga_id),
  CONSTRAINT fk_fav_vaga_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario),
  CONSTRAINT fk_fav_vaga_vaga FOREIGN KEY (vaga_id) REFERENCES vaga(id_vaga)
) ENGINE=InnoDB;

CREATE TABLE favorito_candidato (
  id_favorito_candidato INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  candidato_id INT UNSIGNED NOT NULL,
  UNIQUE KEY uq_favorito_candidato (usuario_id, candidato_id),
  CONSTRAINT fk_fav_candidato_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario),
  CONSTRAINT fk_fav_candidato_candidato FOREIGN KEY (candidato_id) REFERENCES candidato(id_candidato)
) ENGINE=InnoDB;

CREATE TABLE notificacao (
  id_notificacao INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN NOT NULL DEFAULT FALSE,
  link VARCHAR(500),
  criada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notificacao_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario)
) ENGINE=InnoDB;

-- Regras adicionais a validar na aplicação:
-- 1) perfil do usuario compatível com candidato/recrutador e exclusivo;
-- 2) recrutador que cadastra a vaga deve pertencer à empresa da vaga;
-- 3) etapa no histórico deve pertencer à mesma vaga da candidatura;
-- 4) somente perfis autorizados podem criar favoritos, vagas e alterações de status;
-- 5) um candidato deve possuir currículo conforme fluxo de cadastro adotado.
