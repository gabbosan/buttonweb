<?php

namespace App\Http\Controllers\Api;

use App\Events\NovoPedido;
use App\Events\PedidoAtualizado;
use App\Http\Controllers\Controller;
use App\Models\Pedido;
use Illuminate\Http\Request;

class PedidoController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->only(['cliente_id','fornecedor_id','itens','total','plataforma']);
        $pedido = Pedido::create($data);

        event(new NovoPedido($pedido));

        return response()->json($pedido, 201);
    }

    public function update(Request $request, Pedido $pedido)
    {
        $pedido->update($request->only(['status','itens','total']));
        event(new PedidoAtualizado($pedido));
        return response()->json($pedido);
    }

    public function show(Pedido $pedido)
    {
        return response()->json($pedido);
    }

    public function index()
    {
        return response()->json(Pedido::latest()->limit(50)->get());
    }
}
