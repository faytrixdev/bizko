"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { activatePartner, deactivatePartner, setCommissionRate, markPayoutPaid, rejectPayout } from "./actions";
import type { PartnerAdminData } from "./data";

function formatAmount(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export function PartnersClient({ data }: { data: PartnerAdminData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rateInputs, setRateInputs] = useState<Record<string, string>>({});

  function wrap(action: (fd: FormData) => Promise<unknown>, fd: FormData) {
    startTransition(async () => {
      await action(fd);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      {data.pendingPayouts.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="mb-4 text-sm font-semibold text-amber-800 uppercase tracking-wider">
            Retraits à traiter ({data.pendingPayouts.length})
          </h2>
          <div className="space-y-3">
            {data.pendingPayouts.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-white p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {p.partner_display_name || p.partner_username || p.partner_id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {p.method} · {p.account_identifier} · {formatDate(p.created_at)}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-bold text-gray-900">{formatAmount(p.amount)}</p>
                <div className="flex shrink-0 gap-2">
                  <form action={(fd) => wrap(markPayoutPaid, fd)}>
                    <input type="hidden" name="payoutId" value={p.id} />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      Payer
                    </button>
                  </form>
                  <form action={(fd) => wrap(rejectPayout, fd)}>
                    <input type="hidden" name="payoutId" value={p.id} />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      Rejeter
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Partenaires ({data.partners.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Utilisateur</th>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3 text-right">Taux</th>
                <th className="px-6 py-3 text-right">Parrainés</th>
                <th className="px-6 py-3 text-right">Approuvées</th>
                <th className="px-6 py-3 text-right">En attente</th>
                <th className="px-6 py-3 text-right">Payées</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.partners.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {p.display_name || p.username || p.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-600">{p.partner_code ?? "—"}</td>
                  <td className="px-6 py-4 text-right">
                    <form action={(fd) => wrap(setCommissionRate, fd)} className="inline-flex items-center gap-1">
                      <input type="hidden" name="userId" value={p.id} />
                      <input
                        type="number"
                        name="rate"
                        min={1}
                        max={100}
                        value={rateInputs[p.id] ?? String(p.commission_rate)}
                        onChange={(e) => setRateInputs((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        className="w-16 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-right text-xs text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                      <span className="text-xs text-gray-400">%</span>
                      <button
                        type="submit"
                        disabled={isPending}
                        className="ml-1 rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        ✓
                      </button>
                    </form>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-900">{p.referral_count}</td>
                  <td className="px-6 py-4 text-right text-green-700">{formatAmount(p.commissions_approved)}</td>
                  <td className="px-6 py-4 text-right text-amber-700">{formatAmount(p.commissions_pending)}</td>
                  <td className="px-6 py-4 text-right text-blue-700">{formatAmount(p.commissions_paid)}</td>
                  <td className="px-6 py-4">
                    {p.partner_code ? (
                      <form action={(fd) => wrap(deactivatePartner, fd)}>
                        <input type="hidden" name="userId" value={p.id} />
                        <button
                          type="submit"
                          disabled={isPending}
                          className="rounded border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          Désactiver
                        </button>
                      </form>
                    ) : (
                      <form action={(fd) => wrap(activatePartner, fd)}>
                        <input type="hidden" name="userId" value={p.id} />
                        <input type="hidden" name="rate" value={String(p.commission_rate)} />
                        <button
                          type="submit"
                          disabled={isPending}
                          className="rounded bg-accent px-3 py-1 text-xs font-semibold text-white hover:bg-accent-hover transition-colors disabled:opacity-50"
                        >
                          Activer
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
