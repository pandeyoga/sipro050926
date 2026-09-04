import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StatusPill from "@/components/patterns/StatusPill";
import { LoadingCards, ErrorState } from "@/components/patterns/StateViews";
import { formatIDR } from "@/utils/formatters";
import api from "@/services/apiClient";
import { P91 } from "@/constants/testIds";

/** Popup rincian satu KPI: daftar baris penyusun angka; klik baris → tabel terfilter. */
export default function KpiDrilldownDialog({ target, onOpenChange }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!target) return;
    setData(null); setError("");
    api.get(`/finance/drilldown/${target.key}`, { params: target.bucket ? { bucket: target.bucket } : {} })
      .then((r) => setData(r.data.data))
      .catch((e) => setError(e?.response?.data?.detail || "Gagal memuat rincian."));
  }, [target]);

  const go = (href) => { onOpenChange(false); navigate(href); };

  return (
    <Dialog open={!!target} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid={P91.kpiDialog}>
        <DialogHeader>
          <DialogTitle>{data?.title || target?.label || "Rincian"}</DialogTitle>
          <DialogDescription>
            {data ? <>{data.count} baris · total <b className="tabular-nums text-foreground">{formatIDR(data.total)}</b></>
              : "Memuat baris penyusun angka ini…"}
          </DialogDescription>
        </DialogHeader>
        {error ? <ErrorState message={error} /> : null}
        {!data && !error ? <LoadingCards count={2} /> : null}
        {data ? (
          <div className="max-h-[55vh] space-y-1.5 overflow-y-auto pr-1">
            {!data.rows.length ? (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground" data-testid={P91.kpiDialogEmpty}>
                Tidak ada baris — angka ini nol saat ini.
              </p>
            ) : data.rows.map((r) => (
              <button key={r.id} type="button" onClick={() => go(r.href)} data-testid={`${P91.kpiDialogRow}-${r.id}`}
                className="group flex w-full items-center gap-3 rounded-lg border bg-card px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-accent/50">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.title}</p>
                  {r.subtitle ? <p className="truncate text-xs text-muted-foreground">{r.subtitle}</p> : null}
                </div>
                {r.status ? <StatusPill status={r.status} group={r.status_group} /> : null}
                <span className="w-36 shrink-0 text-right text-sm font-semibold tabular-nums">{formatIDR(r.amount)}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        ) : null}
        {data?.href_all ? (
          <div className="flex justify-end">
            <Button size="sm" onClick={() => go(data.href_all)} data-testid={P91.kpiDialogAll}>
              Buka tabel terfilter <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
