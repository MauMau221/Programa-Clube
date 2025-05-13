<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Verificar o tamanho atual da coluna
        $columnInfo = DB::select("SHOW COLUMNS FROM comandas WHERE Field = 'status'")[0];
        
        // Verificar se o tipo é VARCHAR e o tamanho é menor que 20
        if (strpos($columnInfo->Type, 'varchar') !== false) {
            $currentSize = (int) preg_replace('/[^0-9]/', '', $columnInfo->Type);
            
            if ($currentSize < 20) {
                Schema::table('comandas', function (Blueprint $table) {
                    $table->string('status', 20)->change();
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Não vamos reverter para um tamanho menor, pois isso pode causar truncamento de dados
        // Mantemos a coluna com o tamanho atual
    }
}; 