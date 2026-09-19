"use client";

import React, { useState, useActionState } from "react";
import { requestPayout } from "./actions";
import type { PartnerOverview, PartnerReferral, PartnerPayoutRow } from "@/lib/partner/queries";

interface PartnerDashboardProps {
  overview: PartnerOverview;
  referrals: PartnerReferral[];
  payouts: PartnerPayoutRow[];
  referralLink: string;
  minPayout: number;
  canRequestPayout: boolean;
}

function formatAmount(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-blue-50 text-blue-700 border-blue-200",
    paid: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? "bg-gray-50 text-gray-700 border-gray-200"}`}>
      {status}
    </span>
  );
}

export function PartnerDashboard({ overview, referrals, payouts, referralLink, minPayout, canRequestPayout }: PartnerDashboardProps) {
  const [copied, setCopied] = useState(false);
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string; ok?: boolean } | null, formData: FormData) => {
      return await requestPayout(formData);
    },
    null,
  );

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = referralLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const stats = [
    { label: "Parrainages", value: overview.referralCount },
    { label: "Payeurs", value: overview.payersCount },
    { label: "Générées", value: formatAmount(overview.commissionsGenerated) },
    { label: "En attente", value: formatAmount(overview.commissionsPending) },
    { label: "Approuvées", value: formatAmount(overview.commissionsApproved) },
    { label: "Payées", value: formatAmount(overview.commissionsPaid) },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">Espace partenaire</h1>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Lien de parrainage</h2>
        <div className="flex items-center gap-3">
          <code className="flex-1 truncate rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-800">{referralLink}</code>
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
          >
            {copied ? "Copié !" : "Copier"}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">Partagez ce lien pour parrainer de nouveaux utilisateurs.</p>
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{s.label}</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
        <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Solde disponible</p>
          <p className="mt-1 text-xl font-bold text-accent">{formatAmount(overview.availableBalance)}</p>
        </div>
      </section>

      {referrals.length > 0 && (
        <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Historique des parrainages</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Utilisateur</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Paiement</th>
                  <th className="px-6 py-3 text-right">Commission</th>
                  <th className="px-6 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {referrals.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {r.referredDisplayName || r.referredUsername || r.referredUserProfileId.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(r.createdAt)}</td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {r.latestPaymentTotal != null ? formatAmount(r.latestPaymentTotal) : "—"}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {r.commissionAmount != null ? formatAmount(r.commissionAmount) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      {r.commissionStatus ? <StatusBadge status={r.commissionStatus} /> : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Retraits</h2>

        {payouts.length > 0 && (
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2 text-right">Montant</th>
                  <th className="px-4 py-2">Méthode</th>
                  <th className="px-4 py-2">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-500">{formatDate(p.createdAt)}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{formatAmount(p.amount)}</td>
                    <td className="px-4 py-3 text-gray-700 capitalize">{p.status}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <form action={isPending ? undefined : formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="amount" className="mb-1 block text-xs font-medium text-gray-500">Montant (FCFA)</label>
              <input
                type="number"
                id="amount"
                name="amount"
                min={minPayout}
                step={100}
                required
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <p className="mt-1 text-xs text-gray-400">Minimum : {formatAmount(minPayout)}</p>
            </div>
            <div>
              <label htmlFor="method" className="mb-1 block text-xs font-medium text-gray-500">Méthode</label>
              <select
                id="method"
                name="method"
                required
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">Choisir…</option>
                <option value="orange_money">Orange Money</option>
                <option value="mtn_money">MTN Mobile Money</option>
                <option value="wave">Wave</option>
                <option value="bank_transfer">Virement bancaire</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="account_identifier" className="mb-1 block text-xs font-medium text-gray-500">Numéro de compte</label>
            <input
              type="text"
              id="account_identifier"
              name="account_identifier"
              required
              placeholder="Numéro de téléphone ou IBAN"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="account_holder" className="mb-1 block text-xs font-medium text-gray-500">Titulaire du compte (optionnel)</label>
              <input
                type="text"
                id="account_holder"
                name="account_holder"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label htmlFor="details" className="mb-1 block text-xs font-medium text-gray-500">Détails (optionnel)</label>
              <input
                type="text"
                id="details"
                name="details"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          {state && "error" in state && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
              {state.error === "below_minimum" && `Montant minimum : ${formatAmount(minPayout)}`}
              {state.error === "incomplete" && "Veuillez remplir la méthode et le numéro de compte."}
              {state.error === "insufficient_balance" && "Solde insuffisant."}
              {state.error === "not_partner" && "Accès partenaire requis."}
              {state.error === "failed" && "Une erreur est survenue. Réessayez."}
            </p>
          )}
          {state && "ok" in state && (
            <p className="rounded-lg bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-700">
              Demande de retrait envoyée avec succès.
            </p>
          )}

          <button
            type="submit"
            disabled={!canRequestPayout || isPending}
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Envoi…" : "Demander un retrait"}
          </button>
          {!canRequestPayout && (
            <p className="text-xs text-gray-400">Solde insuffisant pour un retrait (minimum {formatAmount(minPayout)}).</p>
          )}
        </form>
      </section>
    </div>
  );
}
