<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('variantes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produto_id')->constrained('produtos')->onDelete('cascade');
            $table->string('modelo')->nullable();
            $table->string('tamanho')->nullable();
            $table->string('unidade')->nullable();
            $table->string('cor')->nullable();
            $table->decimal('valor', 10, 2)->default(0);
            $table->string('valor_formatado')->nullable();
            $table->integer('estoque')->default(0);
            $table->decimal('peso', 10, 3)->default(0); // kg
            $table->json('dimensoes')->nullable();
            $table->decimal('volume', 12, 6)->default(0); // m3
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('variantes');
    }
};
