<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Produto extends Model
{
    use HasFactory;

    protected $fillable = ['nome','descricao','categoria','modelos'];

    protected $casts = ['modelos' => 'array'];

    public function variantes()
    {
        return $this->hasMany(Variante::class);
    }
}
