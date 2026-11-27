-- JobMatch | Seed Completo para Apresentacao (Banco Vazio)
-- Execute apos jobmatch_tabelas.sql
-- Contem: 41 usuarios (1 Admin, 30 Recrutadores, 10 Candidatos), 30 empresas e 40 vagas.
-- Senha de todos os usuarios: Senha123

SET NAMES utf8mb4;
START TRANSACTION;

-- ============================================================================
-- 1. USUARIOS (IDs 1 a 41: 1 Admin, 30 Recrutadores, 10 Candidatos)
-- ============================================================================
INSERT INTO `usuario` (`id_usuario`, `email`, `senha_hash`, `perfil`, `ativo`) VALUES
-- Administrador (ID 1)
(1, 'admin@jobmatch.com', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'ADMIN', 1),

-- Recrutadores (IDs 2 a 31 -> vinculados as empresas 1 a 30)
(2, 'rh@novatech.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(3, 'talentos@vortexcloud.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(4, 'selecao@finpay.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(5, 'pessoas@medvida.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(6, 'rh@logfast.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(7, 'carreiras@educamais.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(8, 'gente@agroverde.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(9, 'rh@studiopixel.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(10, 'talentos@cyberguard.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(11, 'rh@ecomercex.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(12, 'selecao@construtech.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(13, 'rh@energiasolar.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(14, 'pessoas@datapulse.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(15, 'rh@moburban.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(16, 'carreiras@gamedevbr.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(17, 'rh@foodexpress.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(18, 'talentos@legaltech.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(19, 'rh@biotecnica.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(20, 'selecao@automotivaabc.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(21, 'rh@nexusconsultoria.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(22, 'rh@horizontedigital.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(23, 'talentos@nuvemazul.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(24, 'rh@solarisbank.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(25, 'selecao@vetortech.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(26, 'pessoas@alfaengenharia.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(27, 'rh@orbitasistemas.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(28, 'carreiras@pulsemedia.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(29, 'rh@kryptonsec.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(30, 'talentos@zenithvarejo.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),
(31, 'rh@apexlogistica.com.br', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'RECRUTADOR', 1),

-- Candidatos (IDs 32 a 41)
(32, 'lucas.ferreira@email.com', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'CANDIDATO', 1),
(33, 'mariana.alves@email.com', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'CANDIDATO', 1),
(34, 'gabriel.santos@email.com', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'CANDIDATO', 1),
(35, 'juliana.rocha@email.com', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'CANDIDATO', 1),
(36, 'rafael.mendes@email.com', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'CANDIDATO', 1),
(37, 'beatriz.lima@email.com', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'CANDIDATO', 1),
(38, 'thiago.costa@email.com', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'CANDIDATO', 1),
(39, 'camila.nunes@email.com', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'CANDIDATO', 1),
(40, 'pedro.henrique@email.com', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'CANDIDATO', 1),
(41, 'fernanda.dias@email.com', '3683b6e5a226511294feeabd75b96d67:8a8bcc08485f4540f68e4b5e71769583e1d394f9fca73e172e95f4203c7d0fe24482a9d6cef4e77118193bab6ee654f1622c372c9b1e87fa2cc6c6c8cc8c6a01', 'CANDIDATO', 1);

-- ============================================================================
-- 2. EMPRESAS (IDs 1 a 30)
-- ============================================================================
INSERT INTO `empresa` (`id_empresa`, `razao_social`, `nome_fantasia`, `cnpj`, `setor`, `descricao`, `site`, `logo_url`, `cidade`, `uf`) VALUES
(1, 'NovaTech Sistemas S.A.', 'NovaTech', '11222333000101', 'Tecnologia', 'Consultoria e fabrica de software corporativo sob medida.', 'https://novatech.com.br', NULL, 'Sao Paulo', 'SP'),
(2, 'Vortex Cloud Infraestrutura Ltda', 'Vortex Cloud', '11222333000102', 'Cloud & DevOps', 'Especialista em arquitetura em nuvem, SRE e alta disponibilidade.', 'https://vortexcloud.com.br', NULL, 'Sao Caetano do Sul', 'SP'),
(3, 'FinPay Meios de Pagamento S.A.', 'FinPay', '11222333000103', 'Fintech', 'Plataforma digital de pagamentos instantaneos e credito B2B.', 'https://finpay.com.br', NULL, 'Sao Paulo', 'SP'),
(4, 'MedVida Saude Digital Ltda', 'MedVida', '11222333000104', 'Healthtech', 'Telemedicina e prontuario eletronico integrado para clinicas.', 'https://medvida.com.br', NULL, 'Campinas', 'SP'),
(5, 'LogFast Transportes e Logistica Ltda', 'LogFast', '11222333000105', 'Logistica', 'Roteirizacao inteligente e rastreamento de cargas em tempo real.', 'https://logfast.com.br', NULL, 'Guarulhos', 'SP'),
(6, 'EducaMais Plataforma de Ensino S.A.', 'EducaMais', '11222333000106', 'Edtech', 'Ambiente virtual de aprendizagem para ensino tecnico e superior.', 'https://educamais.com.br', NULL, 'Curitiba', 'PR'),
(7, 'AgroVerde Tecnologia Agricola Ltda', 'AgroVerde', '11222333000107', 'Agrotech', 'Monitoramento de safras via satelite e IoT no campo.', 'https://agroverde.com.br', NULL, 'Ribeirao Preto', 'SP'),
(8, 'Studio Pixel Design e Produto Ltda', 'Studio Pixel', '11222333000108', 'Design & UX', 'Estudio de design de interfaces, pesquisa com usuarios e branding.', 'https://studiopixel.com.br', NULL, 'Florianopolis', 'SC'),
(9, 'CyberGuard Seguranca da Informacao S.A.', 'CyberGuard', '11222333000109', 'Ciberseguranca', 'Pentest, SOC 24/7 e adequacao a LGPD para grandes empresas.', 'https://cyberguard.com.br', NULL, 'Sao Paulo', 'SP'),
(10, 'EcommerceX Varejo Digital Ltda', 'EcommerceX', '11222333000110', 'E-commerce', 'Marketplace e solucoes omnichannel para varejistas.', 'https://ecommercex.com.br', NULL, 'Barueri', 'SP'),
(11, 'ConstruTech Engenharia Digital Ltda', 'ConstruTech', '11222333000111', 'Construtech', 'Software de gestao de obras, orcamentos e modelagem BIM.', 'https://construtech.com.br', NULL, 'Belo Horizonte', 'MG'),
(12, 'EnergiaSolar Brasil S.A.', 'EnergiaSolar', '11222333000112', 'Energia Limpa', 'Gestao de usinas fotovoltaicas e eficiencia energetica.', 'https://energiasolar.com.br', NULL, 'Sorocaba', 'SP'),
(13, 'DataPulse Inteligencia Analitica Ltda', 'DataPulse', '11222333000113', 'Dados & IA', 'Engenharia de dados, machine learning e BI corporativo.', 'https://datapulse.com.br', NULL, 'Sao Paulo', 'SP'),
(14, 'MobUrban Mobilidade Inteligente Ltda', 'MobUrban', '11222333000114', 'Mobilidade', 'Aplicativos de transporte corporativo e gestao de frotas eletricas.', 'https://moburban.com.br', NULL, 'Rio de Janeiro', 'RJ'),
(15, 'GameDevBR Entretenimento Digital Ltda', 'GameDevBR', '11222333000115', 'Games', 'Desenvolvimento de jogos mobile e experiencias interativas.', 'https://gamedevbr.com.br', NULL, 'Porto Alegre', 'RS'),
(16, 'FoodExpress Tecnologia Gastronomica S.A.', 'FoodExpress', '11222333000116', 'Foodtech', 'Sistema de PDV, delivery e gestao de estoque para restaurantes.', 'https://foodexpress.com.br', NULL, 'Sao Bernardo do Campo', 'SP'),
(17, 'LegalTech Automacao Juridica Ltda', 'LegalTech', '11222333000117', 'Legaltech', 'Automacao de contratos e jurimetria com inteligencia artificial.', 'https://legaltech.com.br', NULL, 'Sao Paulo', 'SP'),
(18, 'BioTecnica Laboratorios e Pesquisa S.A.', 'BioTecnica', '11222333000118', 'Biotecnologia', 'Sistemas laboratoriais e analise genomica.', 'https://biotecnica.com.br', NULL, 'Campinas', 'SP'),
(19, 'Automotiva ABC Sistemas Embarcados Ltda', 'Automotiva ABC', '11222333000119', 'Automotivo', 'Telemetria veicular e software embarcado para industria.', 'https://automotivaabc.com.br', NULL, 'Santo Andre', 'SP'),
(20, 'Nexus Consultoria Empresarial Ltda', 'Nexus Consultoria', '11222333000120', 'Consultoria', 'Transformacao digital, agilidade e alocacao de squads.', 'https://nexusconsultoria.com.br', NULL, 'Sao Paulo', 'SP'),
(21, 'Horizonte Digital Tecnologia Ltda', 'Horizonte Digital', '11222333000121', 'Tecnologia', 'Desenvolvimento de portais web e aplicativos sob demanda.', 'https://horizontedigital.com.br', NULL, 'Sao Paulo', 'SP'),
(22, 'Nuvem Azul Solucoes Ltda', 'Nuvem Azul', '11222333000122', 'Cloud & Dados', 'Integracao de sistemas e migracao de bancos de dados.', 'https://nuvemazul.com.br', NULL, 'Santo Andre', 'SP'),
(23, 'Solaris Bank Servicos Financeiros S.A.', 'Solaris Bank', '11222333000123', 'Fintech', 'Conta digital corporativa, APIs bancarias e investimentos.', 'https://solarisbank.com.br', NULL, 'Sao Paulo', 'SP'),
(24, 'VetorTech Automacao Industrial Ltda', 'VetorTech', '11222333000124', 'Industria 4.0', 'Sistemas SCADA, robotica e monitoramento industrial.', 'https://vetortech.com.br', NULL, 'Joinville', 'SC'),
(25, 'Alfa Engenharia e Projetos S.A.', 'Alfa Engenharia', '11222333000125', 'Engenharia', 'Projetos de infraestrutura e sistemas de gestao integrada.', 'https://alfaengenharia.com.br', NULL, 'Curitiba', 'PR'),
(26, 'Orbita Sistemas Aeroespaciais Ltda', 'Orbita Sistemas', '11222333000126', 'Tecnologia', 'Software de geoprocessamento e imagens de satelite.', 'https://orbitasistemas.com.br', NULL, 'Sao Jose dos Campos', 'SP'),
(27, 'Pulse Media Comunicacao Digital Ltda', 'Pulse Media', '11222333000127', 'Marketing Tech', 'Plataforma de automacao de marketing e analytics.', 'https://pulsemedia.com.br', NULL, 'Sao Paulo', 'SP'),
(28, 'KryptonSec Defesa Cibernetica Ltda', 'KryptonSec', '11222333000128', 'Ciberseguranca', 'Auditoria de codigo, criptografia e seguranca em nuvem.', 'https://kryptonsec.com.br', NULL, 'Brasilia', 'DF'),
(29, 'Zenith Varejo e Logistica S.A.', 'Zenith Varejo', '11222333000129', 'Varejo', 'Operacoes de e-commerce e centros de distribuicao automatizados.', 'https://zenithvarejo.com.br', NULL, 'Osasco', 'SP'),
(30, 'Apex Logistica Integrada Ltda', 'Apex Logistica', '11222333000130', 'Logistica', 'Gestao portuaria, comercio exterior e rastreamento.', 'https://apexlogistica.com.br', NULL, 'Santos', 'SP');

-- ============================================================================
-- 3. RECRUTADORES (IDs 1 a 30)
-- ============================================================================
INSERT INTO `recrutador` (`id_recrutador`, `usuario_id`, `empresa_id`, `nome`, `cargo`, `admin_empresa`) VALUES
(1, 2, 1, 'Fernanda Azevedo', 'Tech Recruiter Senior', 1),
(2, 3, 2, 'Ricardo Nogueira', 'Coordenador de RH', 1),
(3, 4, 3, 'Camila Vasconcelos', 'Especialista em Atracao', 1),
(4, 5, 4, 'Juliana Prado', 'Business Partner RH', 1),
(5, 6, 5, 'Marcos Vinicius', 'Analista de Recrutamento', 1),
(6, 7, 6, 'Patricia Monteiro', 'Gerente de Pessoas', 1),
(7, 8, 7, 'Rodrigo Campos', 'Tech Recruiter', 1),
(8, 9, 8, 'Aline Teixeira', 'Head de Cultura e RH', 1),
(9, 10, 9, 'Bruno Carvalho', 'Recrutador de Seguranca', 1),
(10, 11, 10, 'Larissa Duarte', 'Analista de Talentos', 1),
(11, 12, 11, 'Diego Almeida', 'Coordenador de Selecao', 1),
(12, 13, 12, 'Vanessa Ribeiro', 'Analista de RH Pleno', 1),
(13, 14, 13, 'Gustavo Borges', 'Tech Recruiter', 1),
(14, 15, 14, 'Renata Pacheco', 'Especialista de RH', 1),
(15, 16, 15, 'Leandro Farias', 'Talent Acquisition', 1),
(16, 17, 16, 'Tatiane Moura', 'Analista de RH', 1),
(17, 18, 17, 'Felipe Barreto', 'Recrutador Tech', 1),
(18, 19, 18, 'Natalia Correia', 'Gestora de Pessoas', 1),
(19, 20, 19, 'Eduardo Santana', 'Analista de RH Senior', 1),
(20, 21, 20, 'Bianca Rezende', 'Tech Recruiter Lead', 1),
(21, 22, 21, 'Marina Costa', 'Analista de RH', 1),
(22, 23, 22, 'Pedro Lima', 'Recrutador', 1),
(23, 24, 23, 'Carla Macedo', 'Especialista de Atracao', 1),
(24, 25, 24, 'Henrique Soares', 'Coordenador de Pessoas', 1),
(25, 26, 25, 'Sabrina Torres', 'Analista de Selecao', 1),
(26, 27, 26, 'Caio Silveira', 'Tech Recruiter', 1),
(27, 28, 27, 'Amanda Pires', 'People Partner', 1),
(28, 29, 28, 'Vitor Hugo Martins', 'Recrutador Senior', 1),
(29, 30, 29, 'Daniela Cunha', 'Analista de RH', 1),
(30, 31, 30, 'Marcelo Tavares', 'Gerente de RH', 1);

-- ============================================================================
-- 4. CANDIDATOS (IDs 1 a 10)
-- ============================================================================
INSERT INTO `candidato` (`id_candidato`, `usuario_id`, `nome`, `cpf`, `data_nascimento`, `telefone`, `cidade`, `uf`, `foto_url`) VALUES
(1, 32, 'Lucas Ferreira', '11122233301', '2000-05-14', '11991110001', 'Sao Caetano do Sul', 'SP', NULL),
(2, 33, 'Mariana Alves', '11122233302', '1999-09-22', '11991110002', 'Sao Paulo', 'SP', NULL),
(3, 34, 'Gabriel Santos', '11122233303', '2001-02-10', '11991110003', 'Santo Andre', 'SP', NULL),
(4, 35, 'Juliana Rocha', '11122233304', '1998-12-05', '11991110004', 'Campinas', 'SP', NULL),
(5, 36, 'Rafael Mendes', '11122233305', '1997-07-19', '21991110005', 'Rio de Janeiro', 'RJ', NULL),
(6, 37, 'Beatriz Lima', '11122233306', '2002-03-30', '41991110006', 'Curitiba', 'PR', NULL),
(7, 38, 'Thiago Costa', '11122233307', '1996-11-11', '31991110007', 'Belo Horizonte', 'MG', NULL),
(8, 39, 'Camila Nunes', '11122233308', '2001-08-25', '48991110008', 'Florianopolis', 'SC', NULL),
(9, 40, 'Pedro Henrique Souza', '11122233309', '2003-01-17', '11991110009', 'Sao Bernardo do Campo', 'SP', NULL),
(10, 41, 'Fernanda Dias', '11122233310', '1998-06-08', '51991110010', 'Porto Alegre', 'RS', NULL);

-- ============================================================================
-- 5. HABILIDADES (IDs 1 a 18)
-- ============================================================================
INSERT INTO `habilidade` (`id_habilidade`, `nome`) VALUES
(1, 'JavaScript'),
(2, 'TypeScript'),
(3, 'React'),
(4, 'Next.js'),
(5, 'Node.js'),
(6, 'Java'),
(7, 'Python'),
(8, 'C#'),
(9, 'PHP'),
(10, 'SQL'),
(11, 'MySQL'),
(12, 'Power BI'),
(13, 'Git'),
(14, 'Docker'),
(15, 'Kubernetes'),
(16, 'AWS'),
(17, 'Figma'),
(18, 'Scrum');

-- ============================================================================
-- 6. CURRICULOS, FORMACOES, EXPERIENCIAS E HABILIDADES DOS CANDIDATOS
-- ============================================================================
INSERT INTO `curriculo` (`id_curriculo`, `candidato_id`, `resumo`, `pretensao_salarial`, `arquivo_pdf_url`, `percentual_preenchido`) VALUES
(1, 1, 'Desenvolvedor Full Stack com foco em Node.js, TypeScript e React.', 5500.00, NULL, 95),
(2, 2, 'Product Designer (UX/UI) com experiencia em design systems e Figma.', 6000.00, NULL, 90),
(3, 3, 'Desenvolvedor Back-end Java e Spring Boot com vivencia em microsservicos.', 6500.00, NULL, 90),
(4, 4, 'Engenheira de Dados com dominio em Python, SQL e arquitetura AWS.', 7500.00, NULL, 95),
(5, 5, 'Especialista DevOps / SRE com foco em Docker, Kubernetes e CI/CD.', 8500.00, NULL, 95),
(6, 6, 'Desenvolvedora Front-end Junior apaixonada por React e Next.js.', 3800.00, NULL, 85),
(7, 7, 'Analista de Seguranca da Informacao e Pentest.', 7000.00, NULL, 90),
(8, 8, 'Product Owner / Scrum Master com experiencia em produtos digitais.', 6800.00, NULL, 90),
(9, 9, 'Estudante de Ciencia da Computacao buscando estagio em desenvolvimento.', 1800.00, NULL, 80),
(10, 10, 'Desenvolvedora Back-end C# e .NET com experiencia em APIs REST.', 6200.00, NULL, 90);

INSERT INTO `formacao` (`id_formacao`, `curriculo_id`, `instituicao`, `curso`, `nivel`, `inicio`, `fim`) VALUES
(1, 1, 'FATEC Sao Caetano do Sul', 'Analise e Desenvolvimento de Sistemas', 'Tecnologo', '2019-02-01', '2022-12-15'),
(2, 2, 'USP', 'Design', 'Bacharelado', '2018-02-01', '2022-12-15'),
(3, 3, 'UFABC', 'Ciencia da Computacao', 'Bacharelado', '2020-02-01', '2024-06-30'),
(4, 4, 'UNICAMP', 'Engenharia de Computacao', 'Bacharelado', '2017-02-01', '2021-12-15'),
(5, 5, 'PUC-Rio', 'Sistemas de Informacao', 'Bacharelado', '2016-02-01', '2020-12-15'),
(6, 6, 'UTFPR', 'Engenharia de Software', 'Bacharelado', '2021-02-01', '2025-12-15'),
(7, 7, 'UFMG', 'Sistemas de Informacao', 'Bacharelado', '2015-02-01', '2019-12-15'),
(8, 8, 'UFSC', 'Administracao e Sistemas', 'Bacharelado', '2019-02-01', '2023-12-15'),
(9, 9, 'Centro Universitario FEI', 'Ciencia da Computacao', 'Bacharelado', '2024-02-01', NULL),
(10, 10, 'PUCRS', 'Ciencia da Computacao', 'Bacharelado', '2017-02-01', '2021-12-15');

INSERT INTO `experiencia` (`id_experiencia`, `curriculo_id`, `empresa`, `cargo`, `descricao`, `inicio`, `fim`, `atual`) VALUES
(1, 1, 'TechABC Sistemas', 'Desenvolvedor Full Stack', 'Desenvolvimento de aplicacoes web em React e Node.js.', '2023-01-15', NULL, 1),
(2, 2, 'Agencia CriaUX', 'UX/UI Designer', 'Prototipacao de interfaces e testes de usabilidade.', '2022-05-01', NULL, 1),
(3, 3, 'Banco Digital Sul', 'Desenvolvedor Java', 'Manutencao de APIs financeiras de alta escala.', '2023-03-01', NULL, 1),
(4, 4, 'DataCore Brasil', 'Engenheira de Dados', 'Construcao de pipelines ETL em Python e AWS.', '2022-01-10', NULL, 1),
(5, 5, 'CloudMaster', 'Engenheiro DevOps', 'Gerenciamento de clusters Kubernetes e automacao.', '2021-06-01', NULL, 1),
(6, 6, 'Startup Sul', 'Estagiaria Front-end', 'Desenvolvimento de componentes em React.', '2024-02-01', '2025-02-01', 0),
(7, 7, 'SecNet Consultoria', 'Analista de Seguranca', 'Analise de vulnerabilidades e resposta a incidentes.', '2020-08-01', NULL, 1),
(8, 8, 'Inova Produto', 'Product Owner', 'Gestao de backlog e metricas de produto.', '2023-02-01', NULL, 1),
(9, 9, 'Empresa Junior FEI', 'Desenvolvedor Trainee', 'Projetos web academicos e institucionais.', '2025-03-01', NULL, 1),
(10, 10, 'Sistemas Sul', 'Desenvolvedora .NET', 'Desenvolvimento de sistemas corporativos em C#.', '2022-04-01', NULL, 1);

INSERT INTO `curriculo_habilidade` (`curriculo_id`, `habilidade_id`, `nivel`) VALUES
(1, 2, 'AVANCADO'), (1, 3, 'AVANCADO'), (1, 5, 'AVANCADO'), (1, 11, 'INTERMEDIARIO'),
(2, 17, 'AVANCADO'), (2, 18, 'INTERMEDIARIO'),
(3, 6, 'AVANCADO'), (3, 10, 'AVANCADO'), (3, 14, 'INTERMEDIARIO'),
(4, 7, 'AVANCADO'), (4, 10, 'AVANCADO'), (4, 16, 'AVANCADO'),
(5, 14, 'AVANCADO'), (5, 15, 'AVANCADO'), (5, 16, 'AVANCADO'),
(6, 1, 'INTERMEDIARIO'), (6, 3, 'INTERMEDIARIO'), (6, 4, 'BASICO'),
(7, 7, 'INTERMEDIARIO'), (7, 16, 'INTERMEDIARIO'),
(8, 18, 'AVANCADO'), (8, 17, 'BASICO'),
(9, 1, 'BASICO'), (9, 11, 'BASICO'), (9, 13, 'INTERMEDIARIO'),
(10, 8, 'AVANCADO'), (10, 10, 'INTERMEDIARIO'), (10, 14, 'BASICO');

-- ============================================================================
-- 7. VAGAS (IDs 1 a 40)
-- ============================================================================
INSERT INTO `vaga` (`id_vaga`, `empresa_id`, `recrutador_id`, `titulo`, `descricao`, `area`, `nivel`, `modalidade`, `tipo_contrato`, `cidade`, `uf`, `salario_min`, `salario_max`, `status`, `publicada_em`, `encerrada_em`) VALUES
(1, 1, 1, 'Desenvolvedor Full Stack Node.js e React', 'Atuar no desenvolvimento de plataformas web modernas com TypeScript, React e Node.js.', 'Desenvolvimento', 'Pleno', 'HIBRIDO', 'CLT', 'Sao Paulo', 'SP', 6000.00, 8500.00, 'PUBLICADA', '2026-11-01 09:00:00', NULL),
(2, 1, 1, 'Tech Lead Java', 'Liderar squad de arquitetura e microsservicos de alta disponibilidade.', 'Desenvolvimento', 'Senior', 'HIBRIDO', 'CLT', 'Sao Paulo', 'SP', 11000.00, 14500.00, 'PUBLICADA', '2026-11-01 10:00:00', NULL),
(3, 2, 2, 'Engenheiro DevOps / SRE Pleno', 'Gerenciar infraestrutura AWS, clusters Kubernetes e esteiras CI/CD.', 'Infraestrutura', 'Pleno', 'REMOTO', 'CLT', 'Sao Caetano do Sul', 'SP', 7500.00, 10500.00, 'PUBLICADA', '2026-11-02 09:30:00', NULL),
(4, 2, 2, 'Analista de Cloud Junior', 'Apoiar na sustentacao de ambientes em nuvem e monitoramento.', 'Infraestrutura', 'Junior', 'HIBRIDO', 'CLT', 'Sao Caetano do Sul', 'SP', 3800.00, 5000.00, 'PUBLICADA', '2026-11-02 14:00:00', NULL),
(5, 3, 3, 'Desenvolvedor Back-end Senior (Pagamentos)', 'Construir motores de liquidacao financeira e integracoes PIX.', 'Desenvolvimento', 'Senior', 'REMOTO', 'CLT', 'Sao Paulo', 'SP', 10500.00, 14000.00, 'PUBLICADA', '2026-11-03 09:00:00', NULL),
(6, 3, 3, 'Product Manager Fintech', 'Definir roadmap de produtos financeiros B2B e acompanhar metricas.', 'Produto', 'Pleno', 'HIBRIDO', 'CLT', 'Sao Paulo', 'SP', 8000.00, 11000.00, 'PUBLICADA', '2026-11-03 11:00:00', NULL),
(7, 4, 4, 'Desenvolvedor Front-end React / Next.js', 'Criar interfaces acessiveis para o portal de telemedicina.', 'Desenvolvimento', 'Pleno', 'REMOTO', 'CLT', 'Campinas', 'SP', 5500.00, 7800.00, 'PUBLICADA', '2026-11-04 09:00:00', NULL),
(8, 4, 4, 'Analista de Suporte Tecnico N2', 'Atendimento especializado a clinicas e integracao de sistemas.', 'Suporte', 'Junior', 'PRESENCIAL', 'CLT', 'Campinas', 'SP', 2800.00, 3600.00, 'PUBLICADA', '2026-11-04 15:00:00', NULL),
(9, 5, 5, 'Analista de Dados Logisticos', 'Criar dashboards em Power BI e otimizar rotas de entrega.', 'Dados', 'Pleno', 'HIBRIDO', 'CLT', 'Guarulhos', 'SP', 4800.00, 6500.00, 'PUBLICADA', '2026-11-05 09:00:00', NULL),
(10, 5, 5, 'Estagiario de TI e Banco de Dados', 'Auxiliar na manutencao de consultas SQL e relatorios.', 'Dados', 'Estagio', 'PRESENCIAL', 'ESTAGIO', 'Guarulhos', 'SP', 1500.00, 1900.00, 'PUBLICADA', '2026-11-05 10:30:00', NULL),
(11, 6, 6, 'Desenvolvedor PHP / Laravel Pleno', 'Evoluir o ambiente virtual de aprendizagem e integracoes academicas.', 'Desenvolvimento', 'Pleno', 'REMOTO', 'CLT', 'Curitiba', 'PR', 5200.00, 7200.00, 'PUBLICADA', '2026-11-06 09:00:00', NULL),
(12, 6, 6, 'Designer Instrucional Digital', 'Estruturar trilhas de aprendizagem e conteudos interativos.', 'Educacao', 'Junior', 'REMOTO', 'CLT', 'Curitiba', 'PR', 3200.00, 4400.00, 'PUBLICADA', '2026-11-06 14:00:00', NULL),
(13, 7, 7, 'Engenheiro de Software IoT / Python', 'Processar telemetria de sensores agricolas em tempo real.', 'Desenvolvimento', 'Pleno', 'HIBRIDO', 'CLT', 'Ribeirao Preto', 'SP', 6500.00, 9000.00, 'PUBLICADA', '2026-11-07 09:00:00', NULL),
(14, 8, 8, 'Product Designer (UX/UI) Pleno', 'Conduzir pesquisas com usuarios e manter nosso Design System no Figma.', 'Design', 'Pleno', 'REMOTO', 'PJ', 'Florianopolis', 'SC', 6000.00, 8500.00, 'PUBLICADA', '2026-11-07 11:30:00', NULL),
(15, 8, 8, 'Estagiario de UI Design', 'Apoiar na criacao de prototipos e componentes visuais.', 'Design', 'Estagio', 'REMOTO', 'ESTAGIO', 'Florianopolis', 'SC', 1400.00, 1800.00, 'PUBLICADA', '2026-11-08 09:00:00', NULL),
(16, 9, 9, 'Analista de Ciberseguranca SOC', 'Monitoramento de ameacas, resposta a incidentes e gestao de SIEM.', 'Seguranca', 'Pleno', 'HIBRIDO', 'CLT', 'Sao Paulo', 'SP', 7000.00, 9500.00, 'PUBLICADA', '2026-11-08 13:00:00', NULL),
(17, 9, 9, 'Consultor Pentest Senior', 'Realizar testes de intrusao em aplicacoes web e infraestrutura.', 'Seguranca', 'Senior', 'REMOTO', 'PJ', 'Sao Paulo', 'SP', 11000.00, 15000.00, 'PUBLICADA', '2026-11-09 09:00:00', NULL),
(18, 10, 10, 'Desenvolvedor Front-end Junior', 'Implementar vitrines e checkout responsivo para e-commerce.', 'Desenvolvimento', 'Junior', 'HIBRIDO', 'CLT', 'Barueri', 'SP', 3500.00, 4800.00, 'PUBLICADA', '2026-11-09 10:00:00', NULL),
(19, 10, 10, 'Analista de QA / Testes Automatizados', 'Garantir qualidade das entregas com testes automatizados.', 'Qualidade', 'Pleno', 'REMOTO', 'CLT', 'Barueri', 'SP', 5000.00, 6800.00, 'PUBLICADA', '2026-11-10 09:00:00', NULL),
(20, 11, 11, 'Desenvolvedor C# / .NET Pleno', 'Desenvolver modulos de orcamento e gestao de obras.', 'Desenvolvimento', 'Pleno', 'HIBRIDO', 'CLT', 'Belo Horizonte', 'MG', 5800.00, 7800.00, 'PUBLICADA', '2026-11-10 14:30:00', NULL),
(21, 12, 12, 'Analista de BI e Indicadores', 'Monitorar geracao de energia fotovoltaica e performance de usinas.', 'Dados', 'Junior', 'PRESENCIAL', 'CLT', 'Sorocaba', 'SP', 3600.00, 4900.00, 'PUBLICADA', '2026-11-11 09:00:00', NULL),
(22, 13, 13, 'Engenheiro de Dados Senior', 'Arquitetar Data Lakes e pipelines de dados na AWS.', 'Dados', 'Senior', 'REMOTO', 'CLT', 'Sao Paulo', 'SP', 10000.00, 13500.00, 'PUBLICADA', '2026-11-12 09:00:00', NULL),
(23, 13, 13, 'Cientista de Dados Pleno', 'Criar modelos preditivos e algoritmos de recomendacao.', 'Dados', 'Pleno', 'REMOTO', 'CLT', 'Sao Paulo', 'SP', 8500.00, 11500.00, 'PUBLICADA', '2026-11-12 15:00:00', NULL),
(24, 14, 14, 'Desenvolvedor Mobile React Native', 'Evoluir aplicativo de mobilidade urbana para iOS e Android.', 'Mobile', 'Pleno', 'HIBRIDO', 'CLT', 'Rio de Janeiro', 'RJ', 6200.00, 8800.00, 'PUBLICADA', '2026-11-13 09:00:00', NULL),
(25, 15, 15, 'Desenvolvedor Unity C# Junior', 'Programar mecanicas e interfaces de jogos mobile.', 'Games', 'Junior', 'REMOTO', 'PJ', 'Porto Alegre', 'RS', 3500.00, 5000.00, 'PUBLICADA', '2026-11-14 09:00:00', NULL),
(26, 16, 16, 'Desenvolvedor Full Stack Junior', 'Manutencao e novas funcionalidades no sistema de PDV web.', 'Desenvolvimento', 'Junior', 'HIBRIDO', 'CLT', 'Sao Bernardo do Campo', 'SP', 3400.00, 4600.00, 'PUBLICADA', '2026-11-15 09:00:00', NULL),
(27, 17, 17, 'Engenheiro de IA / NLP Pleno', 'Treinar modelos de linguagem para leitura automatica de contratos.', 'Dados', 'Pleno', 'REMOTO', 'CLT', 'Sao Paulo', 'SP', 9000.00, 12500.00, 'PUBLICADA', '2026-11-16 09:00:00', NULL),
(28, 18, 18, 'Analista de Sistemas Laboratoriais', 'Integrar equipamentos de laboratorio com banco de dados MySQL.', 'Sistemas', 'Pleno', 'PRESENCIAL', 'CLT', 'Campinas', 'SP', 5000.00, 6800.00, 'PUBLICADA', '2026-11-17 09:00:00', NULL),
(29, 19, 19, 'Desenvolvedor C/C++ Embarcado', 'Desenvolver firmware para modulos de telemetria automotiva.', 'Engenharia', 'Senior', 'PRESENCIAL', 'CLT', 'Santo Andre', 'SP', 9500.00, 12500.00, 'PUBLICADA', '2026-11-18 09:00:00', NULL),
(30, 20, 20, 'Scrum Master / Agile Coach', 'Facilitar cerimonias ageis e apoiar multiplos squads de tecnologia.', 'Produto', 'Pleno', 'HIBRIDO', 'CLT', 'Sao Paulo', 'SP', 7000.00, 9200.00, 'PUBLICADA', '2026-11-18 14:00:00', NULL),
(31, 21, 21, 'Desenvolvedor Front-end React Junior', 'Criar interfaces web responsivas com JavaScript e React.', 'Desenvolvimento', 'Junior', 'REMOTO', 'CLT', 'Sao Paulo', 'SP', 3200.00, 4500.00, 'PUBLICADA', '2026-11-19 09:00:00', NULL),
(32, 22, 22, 'Analista de Dados Junior', 'Construir dashboards e consultar bases de dados SQL.', 'Dados', 'Junior', 'REMOTO', 'CLT', 'Santo Andre', 'SP', 3500.00, 5000.00, 'PUBLICADA', '2026-11-19 11:00:00', NULL),
(33, 23, 23, 'Arquiteto de Solucoes Bancarias', 'Desenhar integracoes Open Finance e APIs de alta seguranca.', 'Arquitetura', 'Senior', 'HIBRIDO', 'CLT', 'Sao Paulo', 'SP', 13000.00, 17000.00, 'PUBLICADA', '2026-11-20 09:00:00', NULL),
(34, 24, 24, 'Engenheiro de Automacao Industrial', 'Programacao de CLPs e integracao com sistemas supervisores.', 'Engenharia', 'Pleno', 'PRESENCIAL', 'CLT', 'Joinville', 'SC', 6500.00, 8800.00, 'PUBLICADA', '2026-11-20 14:00:00', NULL),
(35, 25, 25, 'Analista de Sistemas ERP', 'Parametrizacao de modulos financeiros e suprimentos.', 'Sistemas', 'Pleno', 'HIBRIDO', 'CLT', 'Curitiba', 'PR', 5200.00, 7000.00, 'PUBLICADA', '2026-11-21 09:00:00', NULL),
(36, 26, 26, 'Desenvolvedor Python Geoprocessamento', 'Processamento de imagens de satelite e dados espaciais.', 'Dados', 'Pleno', 'HIBRIDO', 'CLT', 'Sao Jose dos Campos', 'SP', 7000.00, 9500.00, 'PUBLICADA', '2026-11-21 15:00:00', NULL),
(37, 27, 27, 'Analista de Growth e Marketing Analytics', 'Analise de funil de conversao e atribuicao de campanhas.', 'Marketing', 'Junior', 'REMOTO', 'CLT', 'Sao Paulo', 'SP', 3800.00, 5200.00, 'PUBLICADA', '2026-11-22 09:00:00', NULL),
(38, 28, 28, 'Especialista em Seguranca Cloud (AWS)', 'Hardening de contas AWS, IAM e conformidade.', 'Seguranca', 'Senior', 'REMOTO', 'PJ', 'Brasilia', 'DF', 11500.00, 15000.00, 'PUBLICADA', '2026-11-23 09:00:00', NULL),
(39, 29, 29, 'Desenvolvedor Back-end Node.js Pleno', 'APIs de gestao de pedidos, estoque e integracao com transportadoras.', 'Desenvolvimento', 'Pleno', 'HIBRIDO', 'CLT', 'Osasco', 'SP', 6000.00, 8200.00, 'PUBLICADA', '2026-11-24 09:00:00', NULL),
(40, 30, 30, 'Estagiario em Desenvolvimento Web', 'Apoio no desenvolvimento de portais internos e manutencao.', 'Desenvolvimento', 'Estagio', 'HIBRIDO', 'ESTAGIO', 'Santos', 'SP', 1500.00, 1900.00, 'PUBLICADA', '2026-11-25 09:00:00', NULL);

-- ============================================================================
-- 8. ETAPAS DAS VAGAS (IDs 1 a 120 -> 3 etapas padrao para cada vaga 1..40)
-- ============================================================================
INSERT INTO `etapa_vaga` (`id_etapa`, `vaga_id`, `nome`, `ordem`, `descricao`) VALUES
(1, 1, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (2, 1, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (3, 1, 'Resultado final', 3, 'Proposta e feedback.'),
(4, 2, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (5, 2, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (6, 2, 'Resultado final', 3, 'Proposta e feedback.'),
(7, 3, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (8, 3, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (9, 3, 'Resultado final', 3, 'Proposta e feedback.'),
(10, 4, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (11, 4, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (12, 4, 'Resultado final', 3, 'Proposta e feedback.'),
(13, 5, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (14, 5, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (15, 5, 'Resultado final', 3, 'Proposta e feedback.'),
(16, 6, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (17, 6, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (18, 6, 'Resultado final', 3, 'Proposta e feedback.'),
(19, 7, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (20, 7, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (21, 7, 'Resultado final', 3, 'Proposta e feedback.'),
(22, 8, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (23, 8, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (24, 8, 'Resultado final', 3, 'Proposta e feedback.'),
(25, 9, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (26, 9, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (27, 9, 'Resultado final', 3, 'Proposta e feedback.'),
(28, 10, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (29, 10, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (30, 10, 'Resultado final', 3, 'Proposta e feedback.'),
(31, 11, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (32, 11, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (33, 11, 'Resultado final', 3, 'Proposta e feedback.'),
(34, 12, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (35, 12, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (36, 12, 'Resultado final', 3, 'Proposta e feedback.'),
(37, 13, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (38, 13, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (39, 13, 'Resultado final', 3, 'Proposta e feedback.'),
(40, 14, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (41, 14, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (42, 14, 'Resultado final', 3, 'Proposta e feedback.'),
(43, 15, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (44, 15, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (45, 15, 'Resultado final', 3, 'Proposta e feedback.'),
(46, 16, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (47, 16, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (48, 16, 'Resultado final', 3, 'Proposta e feedback.'),
(49, 17, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (50, 17, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (51, 17, 'Resultado final', 3, 'Proposta e feedback.'),
(52, 18, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (53, 18, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (54, 18, 'Resultado final', 3, 'Proposta e feedback.'),
(55, 19, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (56, 19, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (57, 19, 'Resultado final', 3, 'Proposta e feedback.'),
(58, 20, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (59, 20, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (60, 20, 'Resultado final', 3, 'Proposta e feedback.'),
(61, 21, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (62, 21, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (63, 21, 'Resultado final', 3, 'Proposta e feedback.'),
(64, 22, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (65, 22, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (66, 22, 'Resultado final', 3, 'Proposta e feedback.'),
(67, 23, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (68, 23, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (69, 23, 'Resultado final', 3, 'Proposta e feedback.'),
(70, 24, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (71, 24, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (72, 24, 'Resultado final', 3, 'Proposta e feedback.'),
(73, 25, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (74, 25, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (75, 25, 'Resultado final', 3, 'Proposta e feedback.'),
(76, 26, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (77, 26, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (78, 26, 'Resultado final', 3, 'Proposta e feedback.'),
(79, 27, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (80, 27, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (81, 27, 'Resultado final', 3, 'Proposta e feedback.'),
(82, 28, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (83, 28, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (84, 28, 'Resultado final', 3, 'Proposta e feedback.'),
(85, 29, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (86, 29, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (87, 29, 'Resultado final', 3, 'Proposta e feedback.'),
(88, 30, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (89, 30, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (90, 30, 'Resultado final', 3, 'Proposta e feedback.'),
(91, 31, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (92, 31, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (93, 31, 'Resultado final', 3, 'Proposta e feedback.'),
(94, 32, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (95, 32, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (96, 32, 'Resultado final', 3, 'Proposta e feedback.'),
(97, 33, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (98, 33, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (99, 33, 'Resultado final', 3, 'Proposta e feedback.'),
(100, 34, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (101, 34, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (102, 34, 'Resultado final', 3, 'Proposta e feedback.'),
(103, 35, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (104, 35, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (105, 35, 'Resultado final', 3, 'Proposta e feedback.'),
(106, 36, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (107, 36, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (108, 36, 'Resultado final', 3, 'Proposta e feedback.'),
(109, 37, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (110, 37, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (111, 37, 'Resultado final', 3, 'Proposta e feedback.'),
(112, 38, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (113, 38, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (114, 38, 'Resultado final', 3, 'Proposta e feedback.'),
(115, 39, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (116, 39, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (117, 39, 'Resultado final', 3, 'Proposta e feedback.'),
(118, 40, 'Triagem de curriculo', 1, 'Analise inicial do perfil.'), (119, 40, 'Entrevista', 2, 'Entrevista tecnica e cultural.'), (120, 40, 'Resultado final', 3, 'Proposta e feedback.');

-- ============================================================================
-- 9. HABILIDADES DAS VAGAS
-- ============================================================================
INSERT INTO `vaga_habilidade` (`vaga_id`, `habilidade_id`, `obrigatoria`) VALUES
(1, 2, 1), (1, 3, 1), (1, 5, 1),
(2, 6, 1), (2, 14, 1), (2, 16, 0),
(3, 14, 1), (3, 15, 1), (3, 16, 1),
(4, 16, 1), (4, 13, 0),
(5, 6, 1), (5, 10, 1), (5, 15, 0),
(6, 18, 1),
(7, 3, 1), (7, 4, 1), (7, 2, 0),
(9, 10, 1), (9, 12, 1),
(10, 10, 1), (10, 11, 0),
(11, 9, 1), (11, 11, 1),
(13, 7, 1), (13, 14, 0),
(14, 17, 1), (14, 18, 0),
(15, 17, 1),
(18, 1, 1), (18, 3, 1),
(20, 8, 1), (20, 10, 1),
(21, 12, 1), (21, 10, 1),
(22, 7, 1), (22, 10, 1), (22, 16, 1),
(23, 7, 1), (23, 10, 1),
(24, 3, 1), (24, 2, 1),
(25, 8, 1),
(26, 1, 1), (26, 5, 1), (26, 11, 1),
(27, 7, 1), (27, 16, 0),
(28, 11, 1), (28, 10, 1),
(30, 18, 1),
(31, 1, 1), (31, 3, 1),
(32, 10, 1), (32, 12, 1),
(33, 6, 1), (33, 16, 1),
(36, 7, 1), (36, 10, 1),
(38, 16, 1), (38, 14, 0),
(39, 5, 1), (39, 2, 1), (39, 11, 1),
(40, 1, 1), (40, 13, 1);

-- ============================================================================
-- 10. CANDIDATURAS (IDs 1 a 12)
-- ============================================================================
INSERT INTO `candidatura` (`id_candidatura`, `candidato_id`, `vaga_id`, `etapa_atual_id`, `status`, `carta_apresentacao`, `curriculo_snapshot`, `criada_em`) VALUES
(1, 1, 1, 2, 'ENTREVISTA', 'Tenho 3 anos de experiencia com React, Node.js e TypeScript.', '{"resumo": "Desenvolvedor Full Stack com foco em Node.js, TypeScript e React."}', '2026-11-20 10:00:00'),
(2, 1, 39, 115, 'ENVIADA', 'Gostaria de contribuir com APIs Node.js no setor de varejo.', '{"resumo": "Desenvolvedor Full Stack com foco em Node.js, TypeScript e React."}', '2026-11-24 14:00:00'),
(3, 2, 14, 41, 'ENTREVISTA', 'Especialista em Design Systems e pesquisa com usuarios.', '{"resumo": "Product Designer (UX/UI) com experiencia em design systems e Figma."}', '2026-11-20 11:30:00'),
(4, 3, 5, 13, 'EM_ANALISE', 'Atuo com microsservicos Java no setor financeiro.', '{"resumo": "Desenvolvedor Back-end Java e Spring Boot com vivencia em microsservicos."}', '2026-11-21 09:15:00'),
(5, 4, 22, 66, 'APROVADA', 'Experiencia solida construindo Data Lakes na AWS.', '{"resumo": "Engenheira de Dados com dominio em Python, SQL e arquitetura AWS."}', '2026-11-21 14:20:00'),
(6, 5, 3, 8, 'ENTREVISTA', 'Vivencia diaria com Kubernetes, Docker e AWS.', '{"resumo": "Especialista DevOps / SRE com foco em Docker, Kubernetes e CI/CD."}', '2026-11-22 10:00:00'),
(7, 6, 7, 19, 'EM_ANALISE', 'Busco oportunidade para atuar com React e Next.js.', '{"resumo": "Desenvolvedora Front-end Junior apaixonada por React e Next.js."}', '2026-11-22 16:40:00'),
(8, 6, 31, 91, 'ENVIADA', 'Tenho forte interesse na vaga de Front-end React Junior.', '{"resumo": "Desenvolvedora Front-end Junior apaixonada por React e Next.js."}', '2026-11-24 09:30:00'),
(9, 7, 16, 46, 'ENVIADA', 'Experiencia em resposta a incidentes e monitoramento SOC.', '{"resumo": "Analista de Seguranca da Informacao e Pentest."}', '2026-11-23 09:00:00'),
(10, 8, 30, 89, 'ENTREVISTA', 'Facilitacao de squads ageis e gestao de metricas.', '{"resumo": "Product Owner / Scrum Master com experiencia em produtos digitais."}', '2026-11-23 11:10:00'),
(11, 9, 10, 28, 'ENVIADA', 'Estudante da FEI buscando estagio na area de dados.', '{"resumo": "Estudante de Ciencia da Computacao buscando estagio em desenvolvimento."}', '2026-11-24 08:50:00'),
(12, 10, 20, 59, 'ENTREVISTA', 'Desenvolvedora .NET com foco em sistemas corporativos.', '{"resumo": "Desenvolvedora Back-end C# e .NET com experiencia em APIs REST."}', '2026-11-24 15:00:00');

-- ============================================================================
-- 11. HISTORICO DE CANDIDATURAS, NOTIFICACOES E FAVORITOS
-- ============================================================================
INSERT INTO `historico_candidatura` (`id_historico`, `candidatura_id`, `etapa_id`, `autor_usuario_id`, `status`, `feedback`, `motivo_reprovacao`, `data_alteracao`) VALUES
(1, 1, 1, 2, 'EM_ANALISE', 'Curriculo aprovado na triagem.', NULL, '2026-11-21 09:00:00'),
(2, 1, 2, 2, 'ENTREVISTA', 'Candidato convidado para entrevista tecnica.', NULL, '2026-11-22 14:00:00'),
(3, 3, 41, 9, 'ENTREVISTA', 'Portfolio excelente, agendada entrevista.', NULL, '2026-11-21 16:00:00'),
(4, 5, 65, 14, 'ENTREVISTA', 'Otima entrevista tecnica.', NULL, '2026-11-22 11:00:00'),
(5, 5, 66, 14, 'APROVADA', 'Proposta enviada e aceita pela candidata.', NULL, '2026-11-24 17:00:00'),
(6, 6, 8, 3, 'ENTREVISTA', 'Perfil aderente aos requisitos de SRE.', NULL, '2026-11-23 10:30:00'),
(7, 10, 89, 21, 'ENTREVISTA', 'Avancou para conversa com lideranca agil.', NULL, '2026-11-24 11:00:00'),
(8, 12, 59, 12, 'ENTREVISTA', 'Experiencia solida em .NET, agendada entrevista.', NULL, '2026-11-25 09:00:00');

INSERT INTO `notificacao` (`id_notificacao`, `usuario_id`, `titulo`, `mensagem`, `lida`, `link`, `criada_em`) VALUES
(1, 32, 'Entrevista agendada', 'Sua candidatura na NovaTech avancou para a etapa de entrevista.', 0, '/candidaturas', '2026-11-22 14:00:00'),
(2, 33, 'Entrevista agendada', 'A Studio Pixel convidou voce para uma entrevista.', 0, '/candidaturas', '2026-11-21 16:00:00'),
(3, 35, 'Parabens! Voce foi aprovada', 'Sua candidatura para Engenheira de Dados Senior na DataPulse foi aprovada.', 0, '/candidaturas', '2026-11-24 17:00:00'),
(4, 2, 'Nova candidatura recebida', 'Lucas Ferreira se candidatou para Desenvolvedor Full Stack Node.js e React.', 1, '/recrutador', '2026-11-20 10:00:00'),
(5, 14, 'Processo concluido', 'Juliana Rocha aceitou a proposta para Engenheira de Dados Senior.', 0, '/recrutador', '2026-11-24 17:00:00');

INSERT INTO `favorito_candidato` (`id_favorito_candidato`, `usuario_id`, `candidato_id`) VALUES
(1, 2, 1),
(2, 9, 2),
(3, 14, 4),
(4, 3, 5);

INSERT INTO `favorito_vaga` (`id_favorito_vaga`, `usuario_id`, `vaga_id`) VALUES
(1, 32, 1),
(2, 32, 7),
(3, 33, 14),
(4, 35, 22),
(5, 36, 3);

COMMIT;