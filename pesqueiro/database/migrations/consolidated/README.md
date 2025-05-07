# Migrações Consolidadas

Este diretório contém migrações consolidadas para o sistema Pesqueiro API. Cada tabela tem sua própria migração, o que facilita a manutenção e a importação do projeto para outras máquinas.

## Como usar

Para utilizar estas migrações consolidadas em vez das migrações incrementais, siga os passos abaixo:

1. Em uma nova instalação, copie todas as migrações deste diretório para o diretório principal de migrações:

```bash
cp database/migrations/consolidated/* database/migrations/
```

2. Exclua as migrações incrementais que já não são necessárias (opcional):

```bash
# Cuidado! Faça backup antes de excluir.
# Não exclua as migrações padrão do Laravel (users, password_reset_tokens, etc.)
rm database/migrations/2024_06_20_000001_create_base_schema.php
rm database/migrations/2025_05_04_*.php
```

3. Execute as migrações:

```bash
php artisan migrate
```

## Ordem de Execução

As migrações devem ser executadas na seguinte ordem:

1. Migrações padrão do Laravel (users, password_reset_tokens, etc.)
2. 2024_06_20_000004_create_categorias_table.php
3. 2024_06_20_000005_create_produtos_table.php
4. 2024_06_20_000001_create_comandas_table.php
5. 2024_06_20_000002_create_pedidos_table.php
6. 2024_06_20_000003_create_pedido_produto_table.php
7. 2024_06_20_000006_create_estoque_tables.php
8. 2024_06_20_000007_add_role_to_users_table.php

## Observações

- Estas migrações substituem todas as migrações incrementais anteriores.
- Certifique-se de fazer backup do banco de dados antes de substituir as migrações.
- Se você estiver atualizando um projeto existente, considere usar `php artisan migrate:fresh` para recriar todo o banco de dados. 