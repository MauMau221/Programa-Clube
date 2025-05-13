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
APP_KEY=base64:
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

## Instalação da Extensão Redis para PHP no Windows (XAMPP)

Para utilizar o sistema de broadcast em tempo real e o recurso de cancelamento de comandas, é necessário instalar a extensão Redis para PHP. Siga o passo a passo abaixo:

### 1. Baixar a extensão Redis para PHP

Dependendo da sua versão do PHP, você precisará baixar a DLL correspondente:

1. Acesse https://github.com/phpredis/phpredis/actions
2. Clique em qualquer execução de CI recente com o nome "CI"
3. Role para baixo até a seção "Artifacts" 
4. Baixe o arquivo correspondente à sua versão do PHP
   - Para PHP 8.2 x64 Thread Safe: `php_redis-6.0.2-8.2-x64-ts.zip`
   - Para PHP 8.1 x64 Thread Safe: `php_redis-6.0.2-8.1-x64-ts.zip`
   - Adapte conforme sua versão do PHP

### 2. Instalar a extensão

1. Extraia o arquivo ZIP baixado
2. Copie o arquivo `php_redis.dll` para o diretório de extensões do PHP:
   ```
   C:\xampp\php\ext
   ```

### 3. Configurar o PHP para usar a extensão

1. Abra o arquivo `php.ini` localizado em `C:\xampp\php\php.ini`
2. Adicione a seguinte linha na seção de extensões (próximo às outras extensões):
   ```
   extension=redis
   ```

### 4. Reiniciar o servidor Apache

1. Abra o Painel de Controle do XAMPP (xampp-control.exe)
2. Pare o servidor Apache clicando em "Stop"
3. Inicie novamente o servidor Apache clicando em "Start"

### 5. Verificar se a extensão foi carregada

Para verificar se a extensão foi carregada corretamente, você pode:

1. Acessar http://localhost/dashboard/phpinfo.php (ou criar um arquivo PHP com `phpinfo()`)
2. Procurar por "redis" na página
3. Ou executar no terminal:
   ```
   php -m | findstr redis
   ```

### Solução de problemas com a extensão Redis

Se você encontrar o erro `Class "Redis" not found` ao tentar cancelar uma comanda:

1. Verifique se baixou a versão correta da extensão para sua versão do PHP
2. Certifique-se de que o arquivo `php_redis.dll` está no diretório correto
3. Confirme que a linha `extension=redis` foi adicionada ao arquivo `php.ini`
4. Reinicie o Apache após fazer as alterações

Nota: O sistema de broadcast com Redis requer que você tenha o servidor Redis instalado e em execução. Caso contrário, você pode configurar o Laravel para usar o driver de broadcast 'log' no arquivo `.env`:

```
BROADCAST_DRIVER=log
```

## Instalação da Extensão Redis para PHP no Ubuntu Server LTS

Para servidores Linux rodando Ubuntu Server LTS, o procedimento de instalação da extensão Redis é mais direto usando o gerenciador de pacotes:

### 1. Instalar o Servidor Redis

```bash
sudo apt update
sudo apt install redis-server
```

Verifique se o Redis está funcionando:
```bash
sudo systemctl status redis-server
# ou
redis-cli ping
# Deve retornar "PONG"
```

### 2. Instalar a Extensão Redis para PHP

Dependendo da versão do PHP instalada no servidor, use um dos comandos abaixo:

```bash
# Para PHP 8.2
sudo apt install php8.2-redis

# Para PHP 8.1
sudo apt install php8.1-redis

# Para PHP 8.0
sudo apt install php8.0-redis

# Para PHP 7.4
sudo apt install php7.4-redis
```

### 3. Verificar se a Extensão foi Instalada

```bash
php -m | grep redis
```

Deve mostrar "redis" na lista de extensões.

### 4. Reiniciar o Servidor Web

```bash
# Se estiver usando Apache
sudo systemctl restart apache2

# Se estiver usando Nginx com PHP-FPM
sudo systemctl restart php8.2-fpm  # Substitua pelo número da sua versão PHP
sudo systemctl restart nginx
```

### 5. Configuração do Laravel Echo Server no Ubuntu

Instale o Laravel Echo Server usando NPM:

```bash
sudo npm install -g laravel-echo-server
```

Configure o Laravel Echo Server:

```bash
cd /caminho/para/seu/projeto/pesqueiro
laravel-echo-server init
```

Crie um serviço systemd para manter o Laravel Echo Server rodando:

```bash
sudo nano /etc/systemd/system/laravel-echo-server.service
```

Adicione o seguinte conteúdo:

```
[Unit]
Description=Laravel Echo Server
After=network.target

[Service]
User=www-data
Group=www-data
ExecStart=/usr/bin/laravel-echo-server start --dir=/caminho/para/seu/projeto/pesqueiro
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Ative e inicie o serviço:

```bash
sudo systemctl enable laravel-echo-server
sudo systemctl start laravel-echo-server
sudo systemctl status laravel-echo-server
```

Com essas configurações, tanto o Redis quanto o Laravel Echo Server funcionarão como serviços do sistema, sendo iniciados automaticamente quando o servidor for reiniciado.

### 4. Instalando e Configurando Laravel Echo Server

```bash
# Instalar Laravel Echo Server globalmente
sudo npm install -g laravel-echo-server

# Inicializar Laravel Echo Server na pasta do projeto Laravel
cd /caminho/para/projeto/pesqueiro
laravel-echo-server init
```

Siga as instruções para configurar o Laravel Echo Server, usando Redis como driver.

Inicie o servidor:
```bash
laravel-echo-server start
```

Para executar em segundo plano permanentemente:
```bash
sudo npm install -g pm2
pm2 start laravel-echo-server -- start
pm2 save
pm2 startup
```

## Executando Migrações no Ubuntu Server

Quando migrar este projeto para o Ubuntu Server LTS ou qualquer outro ambiente, siga estas etapas para configurar o banco de dados corretamente:

### 1. Verifique a Estrutura das Migrações

O projeto possui dois tipos de migrações:
- Migrações base/consolidadas: Criam a estrutura inicial do banco de dados
- Migrações incrementais: Adicionam recursos adicionais às tabelas existentes

#### Sobre a Pasta 'consolidated'

Na estrutura do projeto existe uma pasta chamada `/pesqueiro/database/migrations/consolidated`. Esta pasta contém as migrações originais que foram utilizadas para criar a estrutura inicial das tabelas. Essas migrações foram posteriormente separadas em arquivos individuais no diretório principal para melhorar a manutenção e evitar conflitos.

**Nota importante:** Você não precisa executar as migrações dentro da pasta `consolidated` diretamente, pois seus conteúdos já estão incorporados nas migrações do diretório principal. Esta pasta serve apenas como referência para a estrutura inicial do banco de dados.

#### Ordem Correta das Migrações

As migrações devem seguir esta ordem para funcionar corretamente (devido às relações de chave estrangeira):

1. Tabelas do sistema Laravel (users, failed_jobs, etc.)
2. Comandas
3. Categorias
4. Produtos (depende de categorias)
5. Pedidos (depende de comandas)
6. Pedido_produto (depende de pedidos e produtos)
7. Estoque

Se encontrar erros de chave estrangeira ao executar as migrações, pode ser necessário renomear os arquivos para garantir a ordem correta de execução.

### 2. Execute as Migrações

```bash
# Dentro da pasta pesqueiro (backend Laravel)
php artisan migrate
```

### 3. Solução de Problemas Comuns

Se encontrar erros durante a migração:

1. **Problema**: Colunas duplicadas (quando campos como `metodo_pagamento` já existem)
   **Solução**: Se isso ocorrer, você pode precisar editar as migrações incrementais para verificar se a coluna existe antes de criá-la:

   ```php
   // Em migrações como 2024_07_25_193344_add_payment_fields_to_comandas_table.php
   if (!Schema::hasColumn('comandas', 'metodo_pagamento')) {
       $table->string('metodo_pagamento')->nullable()->after('status');
   }
   ```

2. **Problema**: Erro ao modificar enums
   **Solução**: Use SQL nativo com verificações, como demonstrado na migração `2025_05_11_103122_add_statuses_to_pedidos_table.php`

3. **Problema**: Conflitos na sequência de migrações
   **Solução**: Se for necessário, você pode resetar e executar novamente:
   ```bash
   php artisan migrate:fresh
   ```
   ⚠️ **ATENÇÃO**: Isso apagará todos os dados existentes!

### 4. Backup do Banco de Dados

Sempre faça um backup do banco de dados antes de migrar:

```bash
# No MySQL
mysqldump -u seu_usuario -p nome_do_banco > backup_pesqueiro.sql

# Restaurar (se necessário)
mysql -u seu_usuario -p nome_do_banco < backup_pesqueiro.sql
```

## Testando a Instalação

Após completar a instalação e migração, teste os principais recursos:

1. Login no sistema
2. Criação de comanda
3. Adição de produtos a um pedido
4. Cancelamento de comanda (verifica se o Redis está funcionando)
5. Notificações na cozinha (verifica se o Laravel Echo Server está funcionando)

## Resumo das Modificações Recentes

### Organização das Migrações (11/05/2025)

- **Estrutura reorganizada:** As migrações foram organizadas para garantir compatibilidade entre ambientes Windows e Ubuntu Server.
- **Migrações de segurança:** Foram adicionadas migrações especiais para garantir que todas as colunas necessárias existam em cada tabela:
  - `ensure_comandas_table_has_all_required_columns`
  - `ensure_pedidos_table_has_all_required_columns`
  - `ensure_pedido_produto_table_has_all_required_columns`
- **Verificações de segurança:** As migrações incrementais agora verificam se as colunas já existem antes de tentar criá-las, evitando erros.
- **Controle de estoque:** O sistema de controle de estoque foi mantido e funciona corretamente ao cancelar comandas.
- **Redis e notificações:** O sistema está configurado para funcionar com Redis para notificações em tempo real, tanto no Windows quanto no Ubuntu.

### Reordenação das Migrações (11/05/2025)

Para resolver problemas de chaves estrangeiras, as migrações principais foram reordenadas para garantir a sequência correta de criação de tabelas:

1. Arquivos foram renomeados para garantir a ordem: `categorias` antes de `produtos`, e `produtos` antes de `pedido_produto`.
2. A ordem correta é:
   ```
   2024_06_20_000001_create_comandas_table.php
   2024_06_20_000002_create_categorias_table.php
   2024_06_20_000003_create_produtos_table.php
   2024_06_20_000004_create_pedidos_table.php
   2024_06_20_000005_create_pedido_produto_table.php
   2024_06_20_000006_create_estoque_tables.php
   ```
3. As migrações agora executam sem erros e o sistema funciona corretamente, incluindo o cancelamento de comandas.