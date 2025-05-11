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
            if (!Schema::hasColumn('comandas', 'metodo_pagamento')) {
                $table->string('metodo_pagamento')->nullable()->after('status');
            }
            
            if (!Schema::hasColumn('comandas', 'pessoas')) {
                $table->unsignedInteger('pessoas')->nullable()->after('metodo_pagamento');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('comandas', function (Blueprint $table) {
            if (Schema::hasColumn('comandas', 'metodo_pagamento')) {
                $table->dropColumn('metodo_pagamento');
            }
            
            if (Schema::hasColumn('comandas', 'pessoas')) {
                $table->dropColumn('pessoas');
            }
        });
    }
}; 