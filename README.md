# team builder

Projeto desenvolvido para a avaliacao N1 da disciplina de Programacao para Sistemas Web. Consiste numa aplicacao Full Stack com interface em React e servidor web em Fastify, focada na gestao de equipas e perfis de treinadores.

## Integrantes

* IAN VIEIRA CORRÊA
* RYANN FLAVYO ALVES HONORATO LESSA
* PIETRO HERRERA VASCONCELLOS DE ALMEIDA
* GABRIEL PERUZZI RODRIGUES
* JOAO ANTONIO FERREIRA MACHADO DA MATTA

## Tecnologias Utilizadas

* Front-end: React, Vite, TypeScript
* Back-end: Node.js, Fastify, TypeScript
* Base de Dados: SQLite com better-sqlite3

## Funcionalidades Principais

* Fluxo de autenticacao simulado com login e logout funcionais.
* Navegacao entre multiplas paginas atraves de um menu central.
* CRUD completo de Perfis e Equipas consumindo a nossa propria API.
* Tratamento visual de estados assincronos como carregamento, erros e ausencia de dados.

## Requisitos Previos

Certifique-se de que tem o Node.js instalado na sua maquina antes de prosseguir com a instalacao.

## Como Instalar e Executar

O sistema e composto por duas partes separadas. E obrigatorio abrir dois terminais distintos para correr a aplicacao corretamente.

### 1. Servidor Back-end

Abra o primeiro terminal na pasta raiz do projeto e siga os passos:

1. Aceda a pasta do servidor:
   cd back-end

2. Instale as dependencias necessarias:
   npm install

3. Inicie o servidor em modo de desenvolvimento:
   npm run dev

O servidor Fastify estara a correr no endereco http://localhost:3000. Nao feche este terminal.

### 2. Interface Front-end

Abra um segundo terminal na pasta raiz do projeto e siga os passos:

1. Aceda a pasta da interface:
   cd front-end

2. Instale as dependencias necessarias:
   npm install

3. Inicie a aplicacao React:
   npm run dev

O site ficara disponivel e pronto a utilizar no seu navegador no endereco http://localhost:5173.
