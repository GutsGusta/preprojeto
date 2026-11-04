-- JobMatch | Dados ficticios para desenvolvimento
-- Execute apos jobmatch_tabelas.sql, em banco vazio.
-- 10 registros por tabela, exceto usuario (21) para preservar perfis e relacionamentos.
-- Senhas/hash herdados do dump original: substituir antes de qualquer ambiente real.
SET NAMES utf8mb4;
START TRANSACTION;

INSERT INTO `usuario` (`id_usuario`, `email`, `senha_hash`, `perfil`, `ativo`) VALUES
(1, 'ana@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'CANDIDATO', 1),
(2, 'bruno@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'CANDIDATO', 1),
(3, 'carla@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'CANDIDATO', 1),
(4, 'recrutador1@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'RECRUTADOR', 1),
(5, 'recrutador2@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'RECRUTADOR', 1),
(6, 'candidato6@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'CANDIDATO', 1),
(7, 'candidato7@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'CANDIDATO', 1),
(8, 'candidato8@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'CANDIDATO', 1),
(9, 'candidato9@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'CANDIDATO', 1),
(10, 'candidato10@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'CANDIDATO', 1),
(11, 'candidato11@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'CANDIDATO', 1),
(12, 'candidato12@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'CANDIDATO', 1),
(13, 'recrutador13@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'RECRUTADOR', 1),
(14, 'recrutador14@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'RECRUTADOR', 1),
(15, 'recrutador15@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'RECRUTADOR', 1),
(16, 'recrutador16@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'RECRUTADOR', 1),
(17, 'recrutador17@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'RECRUTADOR', 1),
(18, 'recrutador18@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'RECRUTADOR', 1),
(19, 'recrutador19@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'RECRUTADOR', 1),
(20, 'recrutador20@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'RECRUTADOR', 1),
(21, 'admin@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'ADMIN', 1);

INSERT INTO `empresa` (`id_empresa`, `razao_social`, `nome_fantasia`, `cnpj`, `setor`, `descricao`, `site`, `logo_url`, `cidade`, `uf`) VALUES
(3, 'Horizonte Digital Tecnologia Ltda', 'Horizonte Digital', '00000000000001', 'Tecnologia', 'Empresa ficticia de desenvolvimento de software.', NULL, NULL, 'Sao Paulo', 'SP'),
(4, 'Nuvem Azul Solucoes Ltda', 'Nuvem Azul', '00000000000002', 'Tecnologia', 'Empresa ficticia de solucoes em nuvem e dados.', NULL, NULL, 'Santo Andre', 'SP'),
(5, 'Empresa Exemplo 5 Ltda', 'Empresa Exemplo 5', '00000000000005', 'Tecnologia', 'Empresa ficticia para testes.', NULL, NULL, 'Sao Paulo', 'SP'),
(6, 'Empresa Exemplo 6 Ltda', 'Empresa Exemplo 6', '00000000000006', 'Tecnologia', 'Empresa ficticia para testes.', NULL, NULL, 'Sao Paulo', 'SP'),
(7, 'Empresa Exemplo 7 Ltda', 'Empresa Exemplo 7', '00000000000007', 'Tecnologia', 'Empresa ficticia para testes.', NULL, NULL, 'Sao Paulo', 'SP'),
(8, 'Empresa Exemplo 8 Ltda', 'Empresa Exemplo 8', '00000000000008', 'Tecnologia', 'Empresa ficticia para testes.', NULL, NULL, 'Sao Paulo', 'SP'),
(9, 'Empresa Exemplo 9 Ltda', 'Empresa Exemplo 9', '00000000000009', 'Tecnologia', 'Empresa ficticia para testes.', NULL, NULL, 'Sao Paulo', 'SP'),
(10, 'Empresa Exemplo 10 Ltda', 'Empresa Exemplo 10', '00000000000010', 'Tecnologia', 'Empresa ficticia para testes.', NULL, NULL, 'Sao Paulo', 'SP'),
(11, 'Empresa Exemplo 11 Ltda', 'Empresa Exemplo 11', '00000000000011', 'Tecnologia', 'Empresa ficticia para testes.', NULL, NULL, 'Sao Paulo', 'SP'),
(12, 'Empresa Exemplo 12 Ltda', 'Empresa Exemplo 12', '00000000000012', 'Tecnologia', 'Empresa ficticia para testes.', NULL, NULL, 'Sao Paulo', 'SP');

INSERT INTO `candidato` (`id_candidato`, `usuario_id`, `nome`, `cpf`, `data_nascimento`, `telefone`, `cidade`, `uf`, `foto_url`) VALUES
(4, 1, 'Ana Martins', '00000000001', '2003-04-12', '11999990001', 'Sao Bernardo do Campo', 'SP', NULL),
(5, 2, 'Bruno Oliveira', '00000000002', '2002-08-21', '11999990002', 'Santo Andre', 'SP', NULL),
(6, 3, 'Carla Souza', '00000000003', '2001-11-03', '11999990003', 'Sao Paulo', 'SP', NULL),
(7, 6, 'Candidato Teste 7', '00000000007', '2002-01-15', '11988880007', 'Sao Paulo', 'SP', NULL),
(8, 7, 'Candidato Teste 8', '00000000008', '2002-01-15', '11988880008', 'Sao Paulo', 'SP', NULL),
(9, 8, 'Candidato Teste 9', '00000000009', '2002-01-15', '11988880009', 'Sao Paulo', 'SP', NULL),
(10, 9, 'Candidato Teste 10', '00000000010', '2002-01-15', '11988880010', 'Sao Paulo', 'SP', NULL),
(11, 10, 'Candidato Teste 11', '00000000011', '2002-01-15', '11988880011', 'Sao Paulo', 'SP', NULL),
(12, 11, 'Candidato Teste 12', '00000000012', '2002-01-15', '11988880012', 'Sao Paulo', 'SP', NULL),
(13, 12, 'Candidato Teste 13', '00000000013', '2002-01-15', '11988880013', 'Sao Paulo', 'SP', NULL);

INSERT INTO `recrutador` (`id_recrutador`, `usuario_id`, `empresa_id`, `nome`, `cargo`, `admin_empresa`) VALUES
(3, 4, 3, 'Marina Costa', 'Analista de RH', 1),
(4, 5, 4, 'Pedro Lima', 'Recrutador', 1),
(5, 13, 5, 'Recrutador Teste 5', 'Analista de RH', 1),
(6, 14, 6, 'Recrutador Teste 6', 'Analista de RH', 1),
(7, 15, 7, 'Recrutador Teste 7', 'Analista de RH', 1),
(8, 16, 8, 'Recrutador Teste 8', 'Analista de RH', 1),
(9, 17, 9, 'Recrutador Teste 9', 'Analista de RH', 1),
(10, 18, 10, 'Recrutador Teste 10', 'Analista de RH', 1),
(11, 19, 11, 'Recrutador Teste 11', 'Analista de RH', 1),
(12, 20, 12, 'Recrutador Teste 12', 'Analista de RH', 1);

INSERT INTO `habilidade` (`id_habilidade`, `nome`) VALUES
(15, 'Git'),
(14, 'Java'),
(9, 'JavaScript'),
(11, 'Node.js'),
(16, 'Power BI'),
(12, 'Python'),
(10, 'React'),
(13, 'SQL'),
(17, 'Habilidade Teste 17'),
(18, 'Habilidade Teste 18');

INSERT INTO `curriculo` (`id_curriculo`, `candidato_id`, `resumo`, `pretensao_salarial`, `arquivo_pdf_url`, `percentual_preenchido`) VALUES
(4, 4, 'Desenvolvedora front-end com experiencia em React e JavaScript.', 3500.00, NULL, 90),
(5, 5, 'Estudante de desenvolvimento de sistemas com conhecimentos em Java e SQL.', 1800.00, NULL, 85),
(6, 6, 'Analista de dados com experiencia em Python, SQL e Power BI.', 4500.00, NULL, 95),
(7, 7, 'Curriculo de teste do candidato 7', 2500, NULL, 80),
(8, 8, 'Curriculo de teste do candidato 8', 2500, NULL, 80),
(9, 9, 'Curriculo de teste do candidato 9', 2500, NULL, 80),
(10, 10, 'Curriculo de teste do candidato 10', 2500, NULL, 80),
(11, 11, 'Curriculo de teste do candidato 11', 2500, NULL, 80),
(12, 12, 'Curriculo de teste do candidato 12', 2500, NULL, 80),
(13, 13, 'Curriculo de teste do candidato 13', 2500, NULL, 80);

INSERT INTO `vaga` (`id_vaga`, `empresa_id`, `recrutador_id`, `titulo`, `descricao`, `area`, `nivel`, `modalidade`, `tipo_contrato`, `cidade`, `uf`, `salario_min`, `salario_max`, `status`, `publicada_em`, `encerrada_em`) VALUES
(6, 3, 3, 'Desenvolvedor Front-end Junior', 'Criar interfaces web com JavaScript e React.', 'Desenvolvimento', 'Junior', 'REMOTO', 'CLT', 'Sao Paulo', 'SP', 3000.00, 4500.00, 'PUBLICADA', '2026-10-20 09:00:00', NULL),
(7, 3, 3, 'Estagiario em Desenvolvimento', 'Apoiar a equipe no desenvolvimento de sistemas.', 'Desenvolvimento', 'Estagio', 'HIBRIDO', 'ESTAGIO', 'Sao Paulo', 'SP', 1400.00, 1800.00, 'PUBLICADA', '2026-10-21 10:00:00', NULL),
(8, 3, 3, 'Desenvolvedor Back-end Java', 'Desenvolver APIs e integrar bancos de dados.', 'Desenvolvimento', 'Pleno', 'HIBRIDO', 'CLT', 'Sao Paulo', 'SP', 5000.00, 7000.00, 'PUBLICADA', '2026-10-22 11:00:00', NULL),
(9, 4, 4, 'Analista de Dados Junior', 'Construir dashboards e consultar bases de dados.', 'Dados', 'Junior', 'REMOTO', 'CLT', 'Santo Andre', 'SP', 3500.00, 5000.00, 'PUBLICADA', '2026-10-23 09:30:00', NULL),
(10, 4, 4, 'Desenvolvedor Python', 'Desenvolver rotinas de automacao e integracoes.', 'Desenvolvimento', 'Pleno', 'PRESENCIAL', 'CLT', 'Santo Andre', 'SP', 4500.00, 6500.00, 'PUBLICADA', '2026-10-24 14:00:00', NULL),
(11, 5, 5, 'Vaga de Teste 11', 'Oportunidade ficticia para testes.', 'Tecnologia', 'Junior', 'REMOTO', 'CLT', 'Sao Paulo', 'SP', 2500, 4000, 'PUBLICADA', '2026-11-01 09:00:00', NULL),
(12, 6, 6, 'Vaga de Teste 12', 'Oportunidade ficticia para testes.', 'Tecnologia', 'Junior', 'REMOTO', 'CLT', 'Sao Paulo', 'SP', 2500, 4000, 'PUBLICADA', '2026-11-01 09:00:00', NULL),
(13, 7, 7, 'Vaga de Teste 13', 'Oportunidade ficticia para testes.', 'Tecnologia', 'Junior', 'REMOTO', 'CLT', 'Sao Paulo', 'SP', 2500, 4000, 'PUBLICADA', '2026-11-01 09:00:00', NULL),
(14, 8, 8, 'Vaga de Teste 14', 'Oportunidade ficticia para testes.', 'Tecnologia', 'Junior', 'REMOTO', 'CLT', 'Sao Paulo', 'SP', 2500, 4000, 'PUBLICADA', '2026-11-01 09:00:00', NULL),
(15, 9, 9, 'Vaga de Teste 15', 'Oportunidade ficticia para testes.', 'Tecnologia', 'Junior', 'REMOTO', 'CLT', 'Sao Paulo', 'SP', 2500, 4000, 'PUBLICADA', '2026-11-01 09:00:00', NULL);

INSERT INTO `etapa_vaga` (`id_etapa`, `vaga_id`, `nome`, `ordem`, `descricao`) VALUES
(16, 6, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'),
(17, 6, 'Entrevista', 2, 'Conversa com o recrutador.'),
(19, 7, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'),
(25, 9, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'),
(28, 10, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'),
(18, 6, 'Resultado final', 3, 'Decisao sobre a candidatura.'),
(20, 7, 'Entrevista', 2, 'Conversa com o recrutador.'),
(21, 7, 'Resultado final', 3, 'Decisao sobre a candidatura.'),
(22, 8, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'),
(23, 8, 'Entrevista', 2, 'Conversa com o recrutador.');

INSERT INTO `formacao` (`id_formacao`, `curriculo_id`, `instituicao`, `curso`, `nivel`, `inicio`, `fim`) VALUES
(4, 4, 'Faculdade Exemplo', 'Analise e Desenvolvimento de Sistemas', 'Tecnologo', '2021-02-01', '2023-12-15'),
(5, 5, 'Escola Tecnica Exemplo', 'Tecnico em Desenvolvimento de Sistemas', 'Tecnico', '2025-02-01', NULL),
(6, 6, 'Universidade Exemplo', 'Ciencia da Computacao', 'Bacharelado', '2019-02-01', '2023-12-15'),
(7, 7, 'Instituicao Exemplo', 'Desenvolvimento de Sistemas', 'Tecnico', '2024-01-01', NULL),
(8, 8, 'Instituicao Exemplo', 'Desenvolvimento de Sistemas', 'Tecnico', '2024-01-01', NULL),
(9, 9, 'Instituicao Exemplo', 'Desenvolvimento de Sistemas', 'Tecnico', '2024-01-01', NULL),
(10, 10, 'Instituicao Exemplo', 'Desenvolvimento de Sistemas', 'Tecnico', '2024-01-01', NULL),
(11, 11, 'Instituicao Exemplo', 'Desenvolvimento de Sistemas', 'Tecnico', '2024-01-01', NULL),
(12, 12, 'Instituicao Exemplo', 'Desenvolvimento de Sistemas', 'Tecnico', '2024-01-01', NULL),
(13, 13, 'Instituicao Exemplo', 'Desenvolvimento de Sistemas', 'Tecnico', '2024-01-01', NULL);

INSERT INTO `experiencia` (`id_experiencia`, `curriculo_id`, `empresa`, `cargo`, `descricao`, `inicio`, `fim`, `atual`) VALUES
(4, 4, 'Agencia Web Ficticia', 'Desenvolvedora Front-end', 'Criacao de interfaces responsivas.', '2024-01-10', NULL, 1),
(5, 5, 'Laboratorio Escolar', 'Monitor de Informatica', 'Apoio a atividades de programacao.', '2025-03-01', '2025-12-01', 0),
(6, 6, 'Dados Exemplo', 'Analista de Dados', 'Elaboracao de relatorios e dashboards.', '2023-08-01', NULL, 1),
(7, 7, 'Empresa de Teste', 'Assistente', 'Experiencia ficticia.', '2024-01-01', NULL, 1),
(8, 8, 'Empresa de Teste', 'Assistente', 'Experiencia ficticia.', '2024-01-01', NULL, 1),
(9, 9, 'Empresa de Teste', 'Assistente', 'Experiencia ficticia.', '2024-01-01', NULL, 1),
(10, 10, 'Empresa de Teste', 'Assistente', 'Experiencia ficticia.', '2024-01-01', NULL, 1),
(11, 11, 'Empresa de Teste', 'Assistente', 'Experiencia ficticia.', '2024-01-01', NULL, 1),
(12, 12, 'Empresa de Teste', 'Assistente', 'Experiencia ficticia.', '2024-01-01', NULL, 1),
(13, 13, 'Empresa de Teste', 'Assistente', 'Experiencia ficticia.', '2024-01-01', NULL, 1);

INSERT INTO `curriculo_habilidade` (`curriculo_id`, `habilidade_id`, `nivel`) VALUES
(4, 9, 'AVANCADO'),
(4, 10, 'INTERMEDIARIO'),
(4, 15, 'INTERMEDIARIO'),
(5, 13, 'INTERMEDIARIO'),
(5, 14, 'INTERMEDIARIO'),
(5, 15, 'BASICO'),
(6, 12, 'AVANCADO'),
(6, 13, 'AVANCADO'),
(6, 16, 'AVANCADO'),
(7, 9, 'BASICO');

INSERT INTO `vaga_habilidade` (`vaga_id`, `habilidade_id`, `obrigatoria`) VALUES
(6, 9, 1),
(6, 10, 1),
(6, 15, 0),
(7, 13, 0),
(7, 15, 0),
(8, 13, 1),
(8, 14, 1),
(9, 12, 0),
(9, 13, 1),
(9, 16, 1);

INSERT INTO `candidatura` (`id_candidatura`, `candidato_id`, `vaga_id`, `etapa_atual_id`, `status`, `carta_apresentacao`, `curriculo_snapshot`, `criada_em`) VALUES
(5, 4, 6, 17, 'ENTREVISTA', 'Tenho interesse na vaga de front-end.', '{\"resumo\": \"Experiencia em React e JavaScript\"}', '2026-10-30 16:39:18'),
(6, 5, 7, 19, 'EM_ANALISE', 'Busco minha primeira oportunidade na area.', '{\"resumo\": \"Conhecimentos em Java e SQL\"}', '2026-10-30 16:39:18'),
(7, 6, 9, 25, 'EM_ANALISE', 'Tenho experiencia em analise de dados.', '{\"resumo\": \"Python, SQL e Power BI\"}', '2026-10-30 16:39:18'),
(8, 6, 10, 28, 'ENVIADA', 'Tenho interesse em automacao com Python.', '{\"resumo\": \"Experiencia em Python\"}', '2026-10-30 16:39:18'),
(9, 7, 11, NULL, 'ENVIADA', 'Candidatura de teste.', NULL, '2026-11-02 10:00:00'),
(10, 8, 12, NULL, 'ENVIADA', 'Candidatura de teste.', NULL, '2026-11-02 10:00:00'),
(11, 9, 13, NULL, 'ENVIADA', 'Candidatura de teste.', NULL, '2026-11-02 10:00:00'),
(12, 10, 14, NULL, 'ENVIADA', 'Candidatura de teste.', NULL, '2026-11-02 10:00:00'),
(13, 11, 15, NULL, 'ENVIADA', 'Candidatura de teste.', NULL, '2026-11-02 10:00:00'),
(14, 12, 11, NULL, 'ENVIADA', 'Candidatura de teste.', NULL, '2026-11-02 10:00:00');

INSERT INTO `historico_candidatura` (`id_historico`, `candidatura_id`, `etapa_id`, `autor_usuario_id`, `status`, `feedback`, `motivo_reprovacao`, `data_alteracao`) VALUES
(4, 5, 16, 4, 'EM_ANALISE', 'Curriculo analisado.', NULL, '2026-10-30 16:39:18'),
(5, 5, 17, 4, 'ENTREVISTA', 'Candidata selecionada para entrevista.', NULL, '2026-10-30 16:39:18'),
(6, 6, 19, 4, 'EM_ANALISE', 'Candidatura em avaliacao.', NULL, '2026-10-30 16:39:18'),
(7, 7, 25, 5, 'EM_ANALISE', 'Perfil recebido para analise.', NULL, '2026-10-30 16:39:18'),
(8, 8, NULL, 4, 'ENVIADA', 'Registro de teste.', NULL, '2026-11-02 10:00:00'),
(9, 9, NULL, 5, 'ENVIADA', 'Registro de teste.', NULL, '2026-11-02 10:00:00'),
(10, 10, NULL, 13, 'ENVIADA', 'Registro de teste.', NULL, '2026-11-02 10:00:00'),
(11, 11, NULL, 14, 'ENVIADA', 'Registro de teste.', NULL, '2026-11-02 10:00:00'),
(12, 12, NULL, 15, 'ENVIADA', 'Registro de teste.', NULL, '2026-11-02 10:00:00'),
(13, 13, NULL, 16, 'ENVIADA', 'Registro de teste.', NULL, '2026-11-02 10:00:00');

INSERT INTO `notificacao` (`id_notificacao`, `usuario_id`, `titulo`, `mensagem`, `lida`, `link`, `criada_em`) VALUES
(1, 1, 'Entrevista agendada', 'Sua candidatura avancou para a etapa de entrevista.', 0, '/candidaturas', '2026-10-30 16:39:18'),
(2, 2, 'Candidatura em analise', 'Sua candidatura esta sendo avaliada.', 0, '/candidaturas', '2026-10-30 16:39:18'),
(3, 3, 'Candidatura recebida', 'Recebemos sua candidatura para Desenvolvedor Python.', 1, '/candidaturas', '2026-10-30 16:39:18'),
(4, 4, 'Nova candidatura', 'Uma nova candidatura foi registrada.', 0, '/recrutador', '2026-10-30 16:39:18'),
(5, 5, 'Notificacao de teste', 'Mensagem ficticia.', 0, NULL, '2026-11-02 10:00:00'),
(6, 6, 'Notificacao de teste', 'Mensagem ficticia.', 0, NULL, '2026-11-02 10:00:00'),
(7, 7, 'Notificacao de teste', 'Mensagem ficticia.', 0, NULL, '2026-11-02 10:00:00'),
(8, 8, 'Notificacao de teste', 'Mensagem ficticia.', 0, NULL, '2026-11-02 10:00:00'),
(9, 9, 'Notificacao de teste', 'Mensagem ficticia.', 0, NULL, '2026-11-02 10:00:00'),
(10, 10, 'Notificacao de teste', 'Mensagem ficticia.', 0, NULL, '2026-11-02 10:00:00');

INSERT INTO `favorito_candidato` (`id_favorito_candidato`, `usuario_id`, `candidato_id`) VALUES
(1, 4, 4),
(2, 5, 6),
(3, 13, 7),
(4, 14, 8),
(5, 15, 9),
(6, 16, 10),
(7, 17, 11),
(8, 18, 12),
(9, 19, 13),
(10, 20, 4);

INSERT INTO `favorito_vaga` (`id_favorito_vaga`, `usuario_id`, `vaga_id`) VALUES
(1, 1, 10),
(2, 2, 6),
(3, 3, 7),
(4, 4, 8),
(5, 5, 9),
(6, 6, 10),
(7, 7, 11),
(8, 8, 12),
(9, 9, 13),
(10, 10, 14);

COMMIT;
