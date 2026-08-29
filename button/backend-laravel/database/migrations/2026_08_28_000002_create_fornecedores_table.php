<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('fornecedores', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('tipo')->nullable();
            $table->string('telefone')->nullable();
            $table->string('email')->nullable();
            $table->string('cnpj')->nullable();
            $table->boolean('mei')->default(false);
            $table->json('endereco')->nullable();
            $table->string('push_token')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('fornecedores');
    }
};
