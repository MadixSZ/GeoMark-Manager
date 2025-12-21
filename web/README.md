# 🌍 GeoMark Manager

**Sistema de Gerenciamento de Mapas e Pontos Geográficos**  
*Teste Técnico para Vaga de Intern Software Developer - NerdMonster*

---

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Funcionalidades](#funcionalidades)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Execução](#instalação-e-execução)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Endpoints](#api-endpoints)
- [Telas do Sistema](#telas-do-sistema)
- [Critérios do Teste Atendidos](#critérios-do-teste-atendidos)
- [Autor](#autor)

---

## 🎯 Visão Geral

O **GeoMark Manager** é um sistema fullstack para criação e gerenciamento de mapas interativos com pontos geográficos. Desenvolvido como parte do processo seletivo da NerdMonster, o projeto demonstra habilidades em desenvolvimento web, banco de dados, APIs REST e interfaces interativas.

**Objetivo:** Criar uma aplicação completa que permita aos usuários criar mapas, adicionar pontos através de interface visual, pesquisar endereços e gerenciar todos os dados de forma intuitiva.

---

## 🛠 Tecnologias Utilizadas

### **Backend**
- **Python 3.8+** com **Flask** - Framework web leve e eficiente
- **Flask-SQLAlchemy** - ORM para banco de dados
- **Flask-CORS** - Habilitar comunicação entre frontend e backend
- **SQLite** - Banco de dados relacional embutido

### **Frontend**
- **React 18** - Biblioteca para construção de interfaces
- **React Router DOM** - Navegação entre páginas
- **Leaflet + React-Leaflet** - Mapas interativos com OpenStreetMap
- **Axios** - Cliente HTTP para consumir a API
- **CSS3** - Estilização customizada com paleta otimizada para mapas

### **Ferramentas**
- **Git** - Controle de versão
- **NPM** - Gerenciador de pacotes Node.js
- **Pip** - Gerenciador de pacotes Python
- **VS Code** - Editor de código recomendado

---

## ✨ Funcionalidades

### ✅ **Requisitos Obrigatórios**

#### **Tela 1 - Listagem de Mapas**
- Lista todos os mapas criados com nome e quantidade de pontos
- Exibe data de criação de cada mapa
- Criação de novos mapas com validação
- Navegação para detalhes de cada mapa

#### **Tela 2 - Detalhe do Mapa (Cadastro de Pontos)**
- Mapa interativo com OpenStreetMap/Leaflet
- Lista lateral com todos os pontos cadastrados
- Indicador visível com total de pontos
- Clique no mapa para adicionar novos pontos
- Modal de cadastro com latitude/longitude automáticas
- Edição de nome dos pontos
- Exclusão individual de pontos
- Exclusão em lote de todos os pontos do mapa
- **NOVO:** Exclusão completa de mapas

### 🚀 **Funcionalidades Extras Implementadas**

#### **Pesquisa Avançada de Endereços**
- Barra de pesquisa integrada com Nominatim API (OpenStreetMap)
- Busca por endereços completos (ex: "Avenida Paulista, São Paulo")
- Centralização automática do mapa no local encontrado
- Sugestão de criação de ponto a partir do resultado

#### **Interface e UX**
- **Paleta de cores otimizada para mapas:**
  - Fundo: `#020617` (slate-950)
  - Cards: `#0f172a` (slate-900) com transparência
  - Destaque: `#38bdf8` (azul claro)
  - Texto secundário: `#94a3b8` (slate-400)
- Design responsivo (mobile/desktop)
- Feedback visual com modais e estados de loading
- Tratamento de erros e conexão
- Confirmações para ações destrutivas

#### **Gerenciamento Avançado**
- Exclusão completa de mapas (com confirmação)
- Relacionamento em cascata (excluir mapa → exclui todos os pontos)
- Health check da API
- CORS configurado para desenvolvimento

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js 16+** e **NPM** ([Download](https://nodejs.org/))
- **Python 3.8+** e **Pip** ([Download](https://www.python.org/downloads/))
- **Git** ([Download](https://git-scm.com/))

---

## 🚀 Instalação e Execução

### **1. Clone o repositório**

```bash
git clone https://github.com/seu-usuario/geo-mark-manager.git
cd geo-mark-manager