/**
 * ARCHIVED PRACTICE — merchant data-table dashboard.
 * Not imported anywhere. Not a Next.js route. Kept for reference only.
 */

/*
"use client";

import { useMemo } from "react";

import { transactions } from "../data/transactions";
import useDataTableStore from "../store/dataTableStore";

import DataTableForm from "../components/DataTableForm";
import DataTable from "../components/DataTable";
import DataDialog from "../components/DataDialog";
import CurrentStreakCard from "../activity/CurrentStreakCard";

const uniqueReceivedCurrencies = [
  ...new Set(transactions.map((item) => item.currency)),
];

const uniqueSettlementCurrencies = [
  ...new Set(transactions.map((item) => item.settlementCurrency)),
];

const uniquePaymentMethods = [
  ...new Set(transactions.map((item) => item.paymentMethod)),
];

const uniqueStatuses = [...new Set(transactions.map((item) => item.status))];

export default function Dashboard() {
  const transactionId = useDataTableStore((state) => state.transactionId);
  const setTransactionId = useDataTableStore((state) => state.setTransactionId);
  const setTransactionModalState = useDataTableStore(
    (state) => state.setTransactionModalState,
  );

  const selectedReceivedCurrency = useDataTableStore(
    (state) => state.selectedRecievedCurrency,
  );

  const selectedSettlementCurrency = useDataTableStore(
    (state) => state.selectedSettlementCurrency,
  );

  const selectedPaymentMethod = useDataTableStore(
    (state) => state.selectedPaymentMethod,
  );

  const selectedStatus = useDataTableStore((state) => state.selectedStatus);

  const selectedMerchantName = useDataTableStore(
    (state) => state.selectedMerchantName,
  );

  const transactionModalState = useDataTableStore(
    (state) => state.transactionModalState,
  );

  const filteredData = useMemo(
    () =>
      transactions.filter((item) => {
        const merchantQuery = selectedMerchantName?.trim().toLowerCase() ?? "";

        const matchesMerchant =
          merchantQuery === "" ||
          item.merchantName.toLowerCase().includes(merchantQuery);

        const matchesReceived =
          selectedReceivedCurrency == null ||
          item.currency === selectedReceivedCurrency;

        const matchesSettlement =
          selectedSettlementCurrency == null ||
          item.settlementCurrency === selectedSettlementCurrency;

        const matchesPayment =
          selectedPaymentMethod === null ||
          item.paymentMethod === selectedPaymentMethod;

        const matchesStatus =
          selectedStatus == null || item.status === selectedStatus;

        return (
          matchesMerchant &&
          matchesReceived &&
          matchesSettlement &&
          matchesStatus &&
          matchesPayment
        );
      }),
    [
      selectedMerchantName,
      selectedReceivedCurrency,
      selectedSettlementCurrency,
      selectedPaymentMethod,
      selectedStatus,
    ],
  );

  const transactionDetails = useMemo(
    () => transactions.find((item) => item.id === transactionId) ?? null,
    [transactionId],
  );

  return (
    <main className="flex min-h-svh w-full flex-col px-3 py-3">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-end px-1 pb-3">
        <CurrentStreakCard />
      </div>

      <div className="mx-auto flex w-full max-w-7xl items-center gap-4">
        <div className="flex h-[82vh] min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Transaction list</h2>
                <p className="text-[11px] text-muted-foreground">
                  Filter transactions by merchant, currency, method or status
                </p>
              </div>

              <span className="text-[11px] text-muted-foreground">
                {filteredData.length} results
              </span>
            </div>

            <DataTableForm
              uniqueReceivedCurrencies={uniqueReceivedCurrencies}
              uniqueSettlementCurrencies={uniqueSettlementCurrencies}
              uniquePaymentMethods={uniquePaymentMethods}
              uniqueStatuses={uniqueStatuses}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            <DataTable rows={filteredData} />
          </div>
        </div>

        {transactionModalState && transactionDetails && (
          <aside className="h-[82vh] w-[320px] shrink-0">
            <DataDialog
              transaction={transactionDetails}
              onClose={() => {
                setTransactionId(null);
                setTransactionModalState(false);
              }}
            />
          </aside>
        )}
      </div>
    </main>
  );
}
*/
