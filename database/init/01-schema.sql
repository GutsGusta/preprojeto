-- JobMatch | Estrutura do banco (sem denuncia_vaga)
-- Execute em um banco vazio. Nao contem dados.
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE `candidato` (
  `id_candidato` int(10) UNSIGNED NOT NULL,
  `usuario_id` int(10) UNSIGNED NOT NULL,
  `nome` varchar(150) NOT NULL,
  `cpf` char(11) NOT NULL,
  `data_nascimento` date DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `uf` char(2) DEFAULT NULL,
  `foto_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `candidatura` (
  `id_candidatura` int(10) UNSIGNED NOT NULL,
  `candidato_id` int(10) UNSIGNED NOT NULL,
  `vaga_id` int(10) UNSIGNED NOT NULL,
  `etapa_atual_id` int(10) UNSIGNED DEFAULT NULL,
  `status` enum('ENVIADA','EM_ANALISE','ENTREVISTA','REPROVADA','APROVADA','DESISTENCIA') NOT NULL DEFAULT 'ENVIADA',
  `carta_apresentacao` text DEFAULT NULL,
  `curriculo_snapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`curriculo_snapshot`)),
  `criada_em` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `curriculo` (
  `id_curriculo` int(10) UNSIGNED NOT NULL,
  `candidato_id` int(10) UNSIGNED NOT NULL,
  `resumo` text DEFAULT NULL,
  `pretensao_salarial` decimal(10,2) DEFAULT NULL,
  `arquivo_pdf_url` varchar(500) DEFAULT NULL,
  `percentual_preenchido` tinyint(3) UNSIGNED NOT NULL DEFAULT 0
) ;

CREATE TABLE `curriculo_habilidade` (
  `curriculo_id` int(10) UNSIGNED NOT NULL,
  `habilidade_id` int(10) UNSIGNED NOT NULL,
  `nivel` enum('BASICO','INTERMEDIARIO','AVANCADO') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `empresa` (
  `id_empresa` int(10) UNSIGNED NOT NULL,
  `razao_social` varchar(200) NOT NULL,
  `nome_fantasia` varchar(200) NOT NULL,
  `cnpj` char(14) NOT NULL,
  `setor` varchar(100) DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `site` varchar(500) DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `cidade` varchar(100) NOT NULL,
  `uf` char(2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `etapa_vaga` (
  `id_etapa` int(10) UNSIGNED NOT NULL,
  `vaga_id` int(10) UNSIGNED NOT NULL,
  `nome` varchar(100) NOT NULL,
  `ordem` int(10) UNSIGNED NOT NULL,
  `descricao` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `experiencia` (
  `id_experiencia` int(10) UNSIGNED NOT NULL,
  `curriculo_id` int(10) UNSIGNED NOT NULL,
  `empresa` varchar(200) NOT NULL,
  `cargo` varchar(150) NOT NULL,
  `descricao` text DEFAULT NULL,
  `inicio` date DEFAULT NULL,
  `fim` date DEFAULT NULL,
  `atual` tinyint(1) NOT NULL DEFAULT 0
) ;

CREATE TABLE `favorito_candidato` (
  `id_favorito_candidato` int(10) UNSIGNED NOT NULL,
  `usuario_id` int(10) UNSIGNED NOT NULL,
  `candidato_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `favorito_vaga` (
  `id_favorito_vaga` int(10) UNSIGNED NOT NULL,
  `usuario_id` int(10) UNSIGNED NOT NULL,
  `vaga_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `formacao` (
  `id_formacao` int(10) UNSIGNED NOT NULL,
  `curriculo_id` int(10) UNSIGNED NOT NULL,
  `instituicao` varchar(200) NOT NULL,
  `curso` varchar(150) NOT NULL,
  `nivel` varchar(50) DEFAULT NULL,
  `inicio` date DEFAULT NULL,
  `fim` date DEFAULT NULL
) ;

CREATE TABLE `habilidade` (
  `id_habilidade` int(10) UNSIGNED NOT NULL,
  `nome` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `historico_candidatura` (
  `id_historico` int(10) UNSIGNED NOT NULL,
  `candidatura_id` int(10) UNSIGNED NOT NULL,
  `etapa_id` int(10) UNSIGNED DEFAULT NULL,
  `autor_usuario_id` int(10) UNSIGNED NOT NULL,
  `status` varchar(30) NOT NULL,
  `feedback` text DEFAULT NULL,
  `motivo_reprovacao` text DEFAULT NULL,
  `data_alteracao` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `notificacao` (
  `id_notificacao` int(10) UNSIGNED NOT NULL,
  `usuario_id` int(10) UNSIGNED NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `mensagem` text NOT NULL,
  `lida` tinyint(1) NOT NULL DEFAULT 0,
  `link` varchar(500) DEFAULT NULL,
  `criada_em` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `recrutador` (
  `id_recrutador` int(10) UNSIGNED NOT NULL,
  `usuario_id` int(10) UNSIGNED NOT NULL,
  `empresa_id` int(10) UNSIGNED NOT NULL,
  `nome` varchar(150) NOT NULL,
  `cargo` varchar(100) DEFAULT NULL,
  `admin_empresa` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `usuario` (
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `email` varchar(255) NOT NULL,
  `senha_hash` varchar(255) NOT NULL,
  `perfil` enum('CANDIDATO','RECRUTADOR','ADMIN') NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `vaga` (
  `id_vaga` int(10) UNSIGNED NOT NULL,
  `empresa_id` int(10) UNSIGNED NOT NULL,
  `recrutador_id` int(10) UNSIGNED NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `descricao` text NOT NULL,
  `area` varchar(100) DEFAULT NULL,
  `nivel` varchar(50) DEFAULT NULL,
  `modalidade` enum('PRESENCIAL','HIBRIDO','REMOTO') NOT NULL,
  `tipo_contrato` varchar(30) NOT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `uf` char(2) DEFAULT NULL,
  `salario_min` decimal(10,2) DEFAULT NULL,
  `salario_max` decimal(10,2) DEFAULT NULL,
  `status` enum('RASCUNHO','PUBLICADA','PAUSADA','ENCERRADA') NOT NULL DEFAULT 'RASCUNHO',
  `publicada_em` datetime DEFAULT NULL,
  `encerrada_em` datetime DEFAULT NULL
) ;

CREATE TABLE `vaga_habilidade` (
  `vaga_id` int(10) UNSIGNED NOT NULL,
  `habilidade_id` int(10) UNSIGNED NOT NULL,
  `obrigatoria` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `candidato`
  ADD PRIMARY KEY (`id_candidato`),
  ADD UNIQUE KEY `usuario_id` (`usuario_id`),
  ADD UNIQUE KEY `cpf` (`cpf`);

ALTER TABLE `candidatura`
  ADD PRIMARY KEY (`id_candidatura`),
  ADD UNIQUE KEY `uq_candidatura_candidato_vaga` (`candidato_id`,`vaga_id`),
  ADD KEY `fk_candidatura_etapa_mesma_vaga` (`vaga_id`,`etapa_atual_id`);

ALTER TABLE `curriculo`
  ADD PRIMARY KEY (`id_curriculo`),
  ADD UNIQUE KEY `candidato_id` (`candidato_id`);

ALTER TABLE `curriculo_habilidade`
  ADD PRIMARY KEY (`curriculo_id`,`habilidade_id`),
  ADD KEY `fk_ch_habilidade` (`habilidade_id`);

ALTER TABLE `empresa`
  ADD PRIMARY KEY (`id_empresa`),
  ADD UNIQUE KEY `cnpj` (`cnpj`);

ALTER TABLE `etapa_vaga`
  ADD PRIMARY KEY (`id_etapa`),
  ADD UNIQUE KEY `uq_etapa_vaga_ordem` (`vaga_id`,`ordem`),
  ADD UNIQUE KEY `uq_etapa_vaga_id` (`vaga_id`,`id_etapa`);

ALTER TABLE `experiencia`
  ADD PRIMARY KEY (`id_experiencia`),
  ADD KEY `fk_experiencia_curriculo` (`curriculo_id`);

ALTER TABLE `favorito_candidato`
  ADD PRIMARY KEY (`id_favorito_candidato`),
  ADD UNIQUE KEY `uq_favorito_candidato` (`usuario_id`,`candidato_id`),
  ADD KEY `fk_fav_candidato_candidato` (`candidato_id`);

ALTER TABLE `favorito_vaga`
  ADD PRIMARY KEY (`id_favorito_vaga`),
  ADD UNIQUE KEY `uq_favorito_vaga` (`usuario_id`,`vaga_id`),
  ADD KEY `fk_fav_vaga_vaga` (`vaga_id`);

ALTER TABLE `formacao`
  ADD PRIMARY KEY (`id_formacao`),
  ADD KEY `fk_formacao_curriculo` (`curriculo_id`);

ALTER TABLE `habilidade`
  ADD PRIMARY KEY (`id_habilidade`),
  ADD UNIQUE KEY `nome` (`nome`);

ALTER TABLE `historico_candidatura`
  ADD PRIMARY KEY (`id_historico`),
  ADD KEY `fk_historico_candidatura` (`candidatura_id`),
  ADD KEY `fk_historico_etapa` (`etapa_id`),
  ADD KEY `fk_historico_autor` (`autor_usuario_id`);

ALTER TABLE `notificacao`
  ADD PRIMARY KEY (`id_notificacao`),
  ADD KEY `fk_notificacao_usuario` (`usuario_id`);

ALTER TABLE `recrutador`
  ADD PRIMARY KEY (`id_recrutador`),
  ADD UNIQUE KEY `usuario_id` (`usuario_id`),
  ADD KEY `fk_recrutador_empresa` (`empresa_id`);

ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`);

ALTER TABLE `vaga`
  ADD PRIMARY KEY (`id_vaga`),
  ADD KEY `fk_vaga_empresa` (`empresa_id`),
  ADD KEY `fk_vaga_recrutador` (`recrutador_id`);

ALTER TABLE `vaga_habilidade`
  ADD PRIMARY KEY (`vaga_id`,`habilidade_id`),
  ADD KEY `fk_vh_habilidade` (`habilidade_id`);

ALTER TABLE `candidato`
  MODIFY `id_candidato` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

ALTER TABLE `candidatura`
  MODIFY `id_candidatura` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

ALTER TABLE `curriculo`
  MODIFY `id_curriculo` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `empresa`
  MODIFY `id_empresa` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `etapa_vaga`
  MODIFY `id_etapa` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

ALTER TABLE `experiencia`
  MODIFY `id_experiencia` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `favorito_candidato`
  MODIFY `id_favorito_candidato` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

ALTER TABLE `favorito_vaga`
  MODIFY `id_favorito_vaga` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

ALTER TABLE `formacao`
  MODIFY `id_formacao` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `habilidade`
  MODIFY `id_habilidade` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

ALTER TABLE `historico_candidatura`
  MODIFY `id_historico` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

ALTER TABLE `notificacao`
  MODIFY `id_notificacao` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `recrutador`
  MODIFY `id_recrutador` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `usuario`
  MODIFY `id_usuario` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

ALTER TABLE `vaga`
  MODIFY `id_vaga` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `candidato`
  ADD CONSTRAINT `fk_candidato_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id_usuario`);

ALTER TABLE `candidatura`
  ADD CONSTRAINT `fk_candidatura_candidato` FOREIGN KEY (`candidato_id`) REFERENCES `candidato` (`id_candidato`),
  ADD CONSTRAINT `fk_candidatura_etapa_mesma_vaga` FOREIGN KEY (`vaga_id`,`etapa_atual_id`) REFERENCES `etapa_vaga` (`vaga_id`, `id_etapa`),
  ADD CONSTRAINT `fk_candidatura_vaga` FOREIGN KEY (`vaga_id`) REFERENCES `vaga` (`id_vaga`);

ALTER TABLE `curriculo`
  ADD CONSTRAINT `fk_curriculo_candidato` FOREIGN KEY (`candidato_id`) REFERENCES `candidato` (`id_candidato`);

ALTER TABLE `curriculo_habilidade`
  ADD CONSTRAINT `fk_ch_curriculo` FOREIGN KEY (`curriculo_id`) REFERENCES `curriculo` (`id_curriculo`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ch_habilidade` FOREIGN KEY (`habilidade_id`) REFERENCES `habilidade` (`id_habilidade`);

ALTER TABLE `etapa_vaga`
  ADD CONSTRAINT `fk_etapa_vaga` FOREIGN KEY (`vaga_id`) REFERENCES `vaga` (`id_vaga`);

ALTER TABLE `experiencia`
  ADD CONSTRAINT `fk_experiencia_curriculo` FOREIGN KEY (`curriculo_id`) REFERENCES `curriculo` (`id_curriculo`);

ALTER TABLE `favorito_candidato`
  ADD CONSTRAINT `fk_fav_candidato_candidato` FOREIGN KEY (`candidato_id`) REFERENCES `candidato` (`id_candidato`),
  ADD CONSTRAINT `fk_fav_candidato_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id_usuario`);

ALTER TABLE `favorito_vaga`
  ADD CONSTRAINT `fk_fav_vaga_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id_usuario`),
  ADD CONSTRAINT `fk_fav_vaga_vaga` FOREIGN KEY (`vaga_id`) REFERENCES `vaga` (`id_vaga`);

ALTER TABLE `formacao`
  ADD CONSTRAINT `fk_formacao_curriculo` FOREIGN KEY (`curriculo_id`) REFERENCES `curriculo` (`id_curriculo`);

ALTER TABLE `historico_candidatura`
  ADD CONSTRAINT `fk_historico_autor` FOREIGN KEY (`autor_usuario_id`) REFERENCES `usuario` (`id_usuario`),
  ADD CONSTRAINT `fk_historico_candidatura` FOREIGN KEY (`candidatura_id`) REFERENCES `candidatura` (`id_candidatura`),
  ADD CONSTRAINT `fk_historico_etapa` FOREIGN KEY (`etapa_id`) REFERENCES `etapa_vaga` (`id_etapa`);

ALTER TABLE `notificacao`
  ADD CONSTRAINT `fk_notificacao_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id_usuario`);

ALTER TABLE `recrutador`
  ADD CONSTRAINT `fk_recrutador_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id_empresa`),
  ADD CONSTRAINT `fk_recrutador_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id_usuario`);

ALTER TABLE `vaga`
  ADD CONSTRAINT `fk_vaga_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id_empresa`),
  ADD CONSTRAINT `fk_vaga_recrutador` FOREIGN KEY (`recrutador_id`) REFERENCES `recrutador` (`id_recrutador`);

ALTER TABLE `vaga_habilidade`
  ADD CONSTRAINT `fk_vh_habilidade` FOREIGN KEY (`habilidade_id`) REFERENCES `habilidade` (`id_habilidade`),
  ADD CONSTRAINT `fk_vh_vaga` FOREIGN KEY (`vaga_id`) REFERENCES `vaga` (`id_vaga`) ON DELETE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;
