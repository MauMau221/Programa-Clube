<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('comandas', function (Blueprint $table) {
            if (!Schema::hasColumn('comandas', 'observacao')) {
                $table->text('observacao')->nullable();
            }
            
            if (!Schema::hasColumn('comandas', 'cliente')) {
                $table->string('cliente')->nullable();
            }
            
            if (!Schema::hasColumn('comandas', 'status')) {
                $table->string('status', 20)->default('aberta');
            }
            
            if (!Schema::hasColumn('comandas', 'metodo_pagamento')) {
                $table->string('metodo_pagamento')->nullable();
            }
            
            if (!Schema::hasColumn('comandas', 'pessoas')) {
                $table->unsignedInteger('pessoas')->nullable();
            }
            
            if (!Schema::hasColumn('comandas', 'mesa')) {
                $table->string('mesa');
            }
            
            if (!Schema::hasColumn('comandas', 'total')) {
                $table->decimal('total', 8, 2)->default(0);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Não fazemos nada no método down, pois essa migração é apenas para garantir
        // que as colunas existam.
    }
};
