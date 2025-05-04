# Sistema Pesqueiro

Sistema de gerenciamento para restaurante especializado em pescados, com controle de estoque, comandas e pedidos.

## Estrutura do Projeto

Este repositório contém duas partes principais:
- `/pesqueiro/` - Backend desenvolvido em Laravel
- `/frontend/pesqueiro-frontend/` - Frontend desenvolvido em Angular

## Requisitos do Sistema

### Backend (Laravel)
- PHP >= 8.1
- Composer
- MySQL >= 5.7 ou MariaDB >= 10.2
- Redis Server (para comunicação em tempo real)
- Extensões PHP: BCMath, Ctype, Fileinfo, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML, Redis

### Frontend (Angular)
- Node.js >= 18.x
- npm >= 9.x

## Instalação e Configuração

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/pesqueiroAPI.git
cd pesqueiroAPI
```

### 2. Configuração do Backend (Laravel)

#### 2.1. Instalação das Dependências

```bash
cd pesqueiro
composer install
```

#### 2.2. Configuração do Ambiente

Crie um arquivo `.env` na pasta `pesqueiro/` com o seguinte conteúdo:

```
APP_NAME=Laravel
APP_ENV=local
APP_KEY=base64:1D6K/bI6zcB0+oNPpIiOstcIUnJ+z9euycu/Bx3O/Ok=
APP_DEBUG=true
APP_URL=http://localhost

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=restaurante
DB_USERNAME=root
DB_PASSWORD=

BROADCAST_DRIVER=redis
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

Nota: Ajuste os valores do banco de dados (DB_*) e Redis conforme sua configuração local.

#### 2.3. Criação do Banco de Dados

Crie um banco de dados MySQL chamado `restaurante` (ou o nome que você definiu no `.env`).

```bash
mysql -u root -p
CREATE DATABASE restaurante;
exit;
```

#### 2.4. Executar Migrações e Seeds

```bash
php artisan migrate
php artisan db:seed
```

#### 2.5. Configurar Redis e Laravel Echo Server

Instale o Redis Server e o Laravel Echo Server:

```bash
# No Ubuntu/Debian
sudo apt install redis-server

# No Windows, baixe o Redis do site oficial ou use o WSL
# https://github.com/microsoftarchive/redis/releases
```

Configure o Laravel Echo Server:

```bash
npm install -g laravel-echo-server
laravel-echo-server init
```

### 3. Configuração do Frontend (Angular)

#### 3.1. Instalação das Dependências

```bash
cd ../frontend/pesqueiro-frontend
npm install
```

#### 3.2. Configuração do Ambiente

```bash
# Crie ou edite o arquivo de ambiente
nano src/environments/environment.ts
```

Adicione o seguinte conteúdo:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  echoHost: 'http://localhost:6001'
};
```

### 4. Execução do Projeto

#### 4.1. Backend

```bash
cd ../../pesqueiro
php artisan serve
# Em outro terminal
laravel-echo-server start
```

#### 4.2. Frontend

```bash
cd ../frontend/pesqueiro-frontend
npm run start
```

Acesse o sistema em: http://localhost:4200

## Funcionalidades

- Gerenciamento de usuários (gerentes, garçons, cozinheiros)
- Categorias e produtos
- Controle de estoque com alertas de estoque baixo
- Gerenciamento de comandas e pedidos
- Notificações em tempo real para novos pedidos e alterações de estoque

## Problemas Comuns

### Erro de CORS

Se encontrar erros de CORS, certifique-se de que o Laravel está configurado para aceitar requisições do frontend:

```php
// pesqueiro/app/Http/Middleware/CorsMiddleware.php
// Certifique-se de que o middleware esteja registrado e configurado corretamente
```

### Problemas com Redis e Notificações

Se as notificações em tempo real não estiverem funcionando:

1. Verifique se o Redis está rodando: `redis-cli ping` (deve retornar "PONG")
2. Verifique se o Laravel Echo Server está rodando e configurado corretamente
3. Certifique-se de que BROADCAST_DRIVER=redis no arquivo .env

### Problemas com Arquivos de Mídia

Certifique-se de que a pasta assets no frontend está configurada corretamente no arquivo angular.json:

```json
"assets": [
  "src/favicon.ico",
  "src/assets"
]
```
