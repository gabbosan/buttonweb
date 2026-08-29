<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PedidoController;

Route::get('/pedidos', [PedidoController::class, 'index']);
Route::post('/pedidos', [PedidoController::class, 'store']);
Route::get('/pedidos/{pedido}', [PedidoController::class, 'show']);
Route::put('/pedidos/{pedido}', [PedidoController::class, 'update']);
