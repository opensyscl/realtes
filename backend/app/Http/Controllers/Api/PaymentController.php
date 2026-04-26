<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Charge;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function store(StorePaymentRequest $request): JsonResponse
    {
        $data = $request->validated();
        $charge = Charge::findOrFail($data['charge_id']);

        $payment = DB::transaction(function () use ($charge, $data, $request) {
            $payment = Payment::create([
                ...$data,
                'agency_id' => $charge->agency_id,
                'registered_by' => $request->user()->id,
            ]);

            $newPaid = (float) $charge->paid_amount + (float) $data['amount'];
            $charge->update([
                'paid_amount' => $newPaid,
                'paid_at' => $newPaid >= (float) $charge->amount
                    ? ($charge->paid_at ?? $data['received_at'])
                    : null,
                'status' => $newPaid >= (float) $charge->amount ? 'pagado'
                    : ($newPaid > 0 ? 'parcial' : $charge->status),
            ]);

            return $payment;
        });

        $payment->load(['charge', 'registeredBy']);

        return (new PaymentResource($payment))->response()->setStatusCode(201);
    }

    public function destroy(Payment $payment): JsonResponse
    {
        DB::transaction(function () use ($payment) {
            $charge = $payment->charge;
            $newPaid = max(0, (float) $charge->paid_amount - (float) $payment->amount);
            $charge->update([
                'paid_amount' => $newPaid,
                'paid_at' => $newPaid >= (float) $charge->amount ? $charge->paid_at : null,
                'status' => $newPaid >= (float) $charge->amount ? 'pagado'
                    : ($newPaid > 0 ? 'parcial' : 'pendiente'),
            ]);
            $payment->delete();
        });

        return response()->json(['ok' => true]);
    }
}
