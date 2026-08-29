<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fornecedor extends Model
{
    use HasFactory;

    protected $fillable = [
        'nome','tipo','telefone','email','cnpj','mei','endereco','push_token'
    ];

    protected $casts = [
        'endereco' => 'array',
        'mei' => 'boolean'
    ];
}
