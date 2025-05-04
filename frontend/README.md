# Sistema Pesqueiro

Sistema de gerenciamento para restaurante especializado em pescados, com controle de estoque, comandas e pedidos.

## Estrutura do Projeto

Este repositório contém duas partes principais:
- `pesqueiro` - Backend desenvolvido em Laravel
- `frontend/pesqueiro-frontend` - Frontend desenvolvido em Angular

## Requisitos do Sistema

### Requisitos Gerais
- Git
- PHP 8.0 ou superior
- Composer
- Node.js 14 ou superior
- npm ou yarn
- MySQL 5.7 ou superior
- Servidor web (Apache/Nginx)

## Instalação e Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/MauMau221/Programa-Clube.git
cd Programa-Clube
```

### 2. Configuração do Backend (Laravel)

#### Instalação de dependências
```bash
cd pesqueiro
composer install
```

#### Configuração do ambiente
```bash
cp .env.example .env
php artisan key:generate
```

Edite o arquivo `.env` com suas configurações de banco de dados:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pesqueiro
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
```

#### Migração e Seed do banco de dados
```bash
php artisan migrate
php artisan db:seed
```

#### Iniciar o servidor de desenvolvimento
```bash
php artisan serve
```
O backend estará disponível em `http://localhost:8000`.

### 3. Configuração do Frontend (Angular)

#### Instalação de dependências
```bash
cd ../frontend/pesqueiro-frontend
npm install
```

#### Configuração do ambiente
Verifique e, se necessário, ajuste o arquivo `src/environments/environment.ts` para apontar para a API correta:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

#### Iniciar o servidor de desenvolvimento
```bash
ng serve
```
O frontend estará disponível em `http://localhost:4200`.

## Características Principais

### Backend (Laravel)
- API RESTful
- Autenticação com Laravel Sanctum
- Sistema de controle de estoque
- Gerenciamento de produtos e categorias
- Sistema de comandas e pedidos
- Relatórios de vendas

### Frontend (Angular)
- Interface responsiva com Bootstrap
- Dashboard administrativo
- Visualização de estoque em tempo real
- Gerenciamento de comandas
- Interface para cozinha
- Notificações em tempo real

## Estrutura do Banco de Dados

O sistema utiliza MySQL com as seguintes tabelas principais:
- `users` - Usuários do sistema
- `categorias` - Categorias de produtos
- `produtos` - Produtos disponíveis
- `comandas` - Comandas abertas pelos clientes
- `comanda_itens` - Itens de cada comanda
- `estoque_movimentos` - Histórico de movimentações de estoque

## Solução de Problemas

### Backend
- Certifique-se de que as permissões de pasta estão corretas
- Verifique os logs em `pesqueiro/storage/logs/laravel.log`
- Problemas de banco de dados podem ser resolvidos com `php artisan migrate:fresh --seed`

### Frontend
- Problemas de CORS: Verifique se o backend está configurado para aceitar requisições do frontend
- Erros de autenticação: Verifique se o token está sendo armazenado corretamente
- Para reconstruir o projeto: `npm run build`

## Contribuição

Se quiser contribuir com este projeto, por favor:
1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request 