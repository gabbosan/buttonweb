<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Variante extends Model
{
    use HasFactory;

    protected $fillable = [
        'produto_id','modelo','tamanho','unidade','cor','valor','valor_formatado','estoque','peso','dimensoes','volume'
    ];

    protected $casts = [
        'dimensoes' => 'array'
    ];

    public function produto()
    {
        return $this->belongsTo(Produto::class);
    }
}
