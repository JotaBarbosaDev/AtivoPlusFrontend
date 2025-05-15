# AtivoPlus - Sistema de Gestão de Investimentos

![AtivoPlus Logo](https://flowbite.s3.amazonaws.com/logo.svg)

[![Estado](https://img.shields.io/badge/Estado-Em%20Desenvolvimento-yellow.svg)](https://github.com/JotaBarbosaDev/AtivoPlusFrontend)
[![Plataforma](https://img.shields.io/badge/Plataforma-Web%20%7C%20Mobile-blue.svg)](https://github.com/JotaBarbosaDev/AtivoPlusFrontend)
[![Licença](https://img.shields.io/badge/Licença-MIT-green.svg)](LICENSE)
[![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-9.0-blueviolet.svg)](https://dotnet.microsoft.com/en-us/apps/aspnet)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3-06B6D4.svg?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Académico](https://img.shields.io/badge/Projeto-Académico-orange.svg)](https://www.ipvc.pt/)
[![Scrum](https://img.shields.io/badge/Metodologia-Scrum-brightgreen.svg)](https://www.scrum.org/)

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Equipa de Desenvolvimento](#equipa-de-desenvolvimento)
- [Metodologia Scrum](#metodologia-scrum)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Páginas](#páginas)
- [Componentes](#componentes)
- [Instalação e Configuração](#instalação-e-configuração)
- [API](#api)
- [Recursos Visuais](#recursos-visuais)
- [Contribuições](#contribuições)
- [Licença](#licença)

## 🌟 Sobre o Projeto

AtivoPlus é uma plataforma web desenvolvida para gestão completa de investimentos financeiros. O sistema permite acompanhar diversos tipos de ativos como imóveis, ações, fundos de investimento e criptomoedas, oferecendo uma visão consolidada da carteira de investimentos do utilizador.

Desenvolvido com ASP.NET Core e Tailwind CSS, o AtivoPlus proporciona uma interface responsiva e moderna, adaptada a diferentes tamanhos de ecrã e com suporte a temas claro e escuro.

Este projeto está a ser desenvolvido no âmbito da unidade curricular de Engenharia de Software II da Licenciatura em Engenharia Informática do Instituto Politécnico de Viana do Castelo (IPVC).

## 👨‍💻 Equipa de Desenvolvimento

Este projeto está a ser desenvolvido por:

- [João Barbosa](https://github.com/JotaBarbosaDev) - Desenvolvedor Frontend
- [Gonçalo Marques](https://github.com/Maruqes) - Desenvolvedor Backend
- [Gonçalo Silva](https://github.com/gsilva222) - Desenvolvedor Frontend
- [Helder Silva](https://github.com/heldersilva28) - Desenvolvedor Backend
- [Rafael Monteiro](https://github.com/rafaeldiogomonteiro) - Desenvolvedor Backend

## 🔄 Metodologia Scrum

O projeto segue a metodologia Scrum, com uma abordagem educacional que visa proporcionar a todos os elementos da equipa uma experiência completa nos diversos papéis:

- **Rotação de Papéis**: Em cada sprint, todos os elementos da equipa assumem diferentes papéis (Scrum Master, Product Owner e Developer) de forma rotativa
- **Objetivos Educacionais**: Esta rotação permite que cada elemento compreenda profundamente as responsabilidades de cada papel no processo de desenvolvimento ágil
- **Sprints**: O desenvolvimento está organizado em sprints de duração fixa
- **Cerimónias**: São realizadas todas as cerimónias Scrum (Sprint Planning, Daily Scrum, Sprint Review e Sprint Retrospective)

Esta abordagem faz parte da aprendizagem prática da unidade curricular de Engenharia de Software II, permitindo aos estudantes experienciar a organização de projetos ágeis em contexto real.

## 💻 Tecnologias Utilizadas

### Backend
- **Framework**: ASP.NET Core (.NET 9.0)
- **Padrão de Arquitetura**: MVC com Razor Pages
- **Linguagem**: C#

### Frontend
- **HTML5**
- **CSS**: Tailwind CSS
- **JavaScript**: Vanilla JS
- **Frameworks UI**: 
  - Flowbite (baseado em Tailwind)
  - DaisyUI
- **Bibliotecas de Gráficos**: ApexCharts

### Integrações
- **API RESTful**: Comunicação com serviços externos
- **Autenticação**: Sistema de login/logout

## ✨ Funcionalidades

### Dashboard Geral
- **Visão Consolidada**: Painel com cards informativos sobre os investimentos
- **Métricas Principais**: Lucro total, resumos de investimentos, preços de ativos
- **Visualização por Dispositivo**: Layout adaptativo para computadores, tablets e telemóveis

### Ativos
- **Listagem Detalhada**: Visualização completa de todos os ativos registados
- **Filtros**: Filtragem por tipo de ativo, carteira e outras propriedades
- **Linha do Tempo de Eventos**: Histórico completo de cada ativo (compra, rendimentos, despesas)
- **Exportação**: Funcionalidade para impressão e exportação de relatórios

### Carteiras
- **Gestão de Carteiras**: Visualização e gestão de múltiplas carteiras de investimento
- **Estado Visual**: Indicadores de desempenho com animações (positivo/negativo)
- **Notificações**: Sistema de toast para feedback de operações

### Mercado
- **Cotações**: Acompanhamento de índices e ativos do mercado financeiro

### Perfil de Utilizador
- **Gestão de Conta**: Configurações de utilizador e preferências
- **Notificações**: Centro de alertas e mensagens do sistema

## 📁 Estrutura do Projeto

```
AtivoPlusFrontend/
├── Pages/                # Páginas Razor
│   ├── Ativos.cshtml     # Gestão de ativos
│   ├── Carteira.cshtml   # Visualização de carteiras
│   ├── Geral.cshtml      # Dashboard principal
│   ├── Index.cshtml      # Página inicial/login
│   ├── Mercado.cshtml    # Visão do mercado financeiro
│   ├── Registo.cshtml    # Registo de utilizadores
│   ├── Shared/           # Componentes partilhados
│   │   └── _Layout.cshtml # Template principal
│   ├── tailwind.css      # Estilos CSS personalizados
├── Program.cs            # Configuração da aplicação
├── AtivoPlusFrontend.csproj # Ficheiro de projeto .NET
├── Properties/           # Configurações de execução
└── bin/ e obj/           # Ficheiros de compilação
```

## 📑 Páginas

### Geral (Dashboard)
Painel principal com visão geral dos investimentos, exibindo:
- Cards com métricas principais (Lucro Total, Resumos de Investimentos, etc.)
- Áreas para gráficos e visualizações de dados
- Layout responsivo com grelha adaptável

### Ativos
Interface detalhada para gestão de ativos:
- Tabela completa com filtros e ordenação
- Detalhes por ativo incluindo: nome, carteira, tipo, quantidade, taxa de juro, preço de compra e lucro
- Modal de linha do tempo para histórico de eventos por ativo
- Funcionalidade de impressão e exportação

### Carteira
Visualização das carteiras de investimento:
- Cards de carteira com imagem e informações resumidas
- Indicadores visuais de desempenho (setas para cima/baixo)
- Percentuais e valores de rendimento
- Sistema de notificações toast para feedback

### Mercado
Interface para acompanhamento do mercado financeiro (cotações, índices, etc.)

### Layout Partilhado
O template base inclui:
- Barra de navegação superior com pesquisa e perfil
- Menu lateral (sidebar) com ligações para as principais áreas
- Sistema de notificações
- Suporte para tema claro/escuro

## 🧩 Componentes

### Modais
- **Timeline Modal**: Exibe histórico de eventos de um ativo específico

### Cards
- **Cards de Dashboard**: Exibem métricas e KPIs na página Geral
- **Cards de Carteira**: Apresentam resumos de carteiras de investimento

### Tabelas
- **Tabela de Ativos**: Listagem detalhada com responsividade para diferentes tamanhos de ecrã

### Notificações
- **Toast Notifications**: Sistema de alertas contextual (sucesso, erro, aviso, info)

## 🔧 Instalação e Configuração

### Requisitos
- .NET SDK 9.0 ou superior
- Node.js (opcional, para desenvolvimento com Tailwind)

### Passos para Execução

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/AtivoPlusFrontend.git
cd AtivoPlusFrontend
```

2. Restaure as dependências .NET:
```bash
dotnet restore
```

3. Execute o projeto:
```bash
dotnet run
```

4. Aceda à aplicação em `https://localhost:5001` ou `http://localhost:5000`

## 🌐 API

A aplicação comunica com uma API para obter dados. Endpoints principais:

- `/api/carteira/ver`: Recupera dados de carteiras de investimento
- `/api/user/logout`: Realiza o término de sessão do utilizador

## 🎨 Recursos Visuais

### Temas
- **Tema Claro/Escuro**: Suporte completo para modo claro e escuro
- **Responsividade**: Layout adaptável para telemóveis, tablets e computadores

### Animações
- Efeitos hover nos cards e botões
- Animações de bounce nos indicadores de valor
- Transições suaves entre estados

## 🤝 Contribuições

Contribuições são bem-vindas! Se quiser contribuir:

1. Faça um fork do projeto
2. Crie uma branch para a sua funcionalidade (`git checkout -b feature/nova-funcionalidade`)
3. Commit as suas alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob os termos da licença MIT. Veja o ficheiro [LICENSE](LICENSE) para mais detalhes

---

Desenvolvido com ❤️ pela equipa AtivoPlus | © 2025 | Atualizado em 23 de abril de 2025