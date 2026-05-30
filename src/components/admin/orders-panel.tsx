"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Eye,
  Download,
  Loader2,
  X,
  Inbox,
  Filter,
  Trash2,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS, LETTER_TYPES, EXTRAS, SENDER_NON_STUDENT_LABEL } from "@/lib/constants";
import { getSpotifyCodeImageUrl } from "@/lib/spotify-code";
import { OrderStats } from "@/components/admin/order-stats";
import { DetailField } from "@/components/admin/detail-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { fetchJson } from "@/lib/fetch-json";

interface Order {
  id: string;
  status: string;
  letter_type: string;
  receiver_name: string;
  receiver_class: string;
  total_amount: number;
  created_at: string;
  identification_mode: string;
  sender_name: string | null;
  sender_class: string | null;
  message: string;
  spotify_link: string | null;
  polaroid_url: string | null;
  extras: { id: string; quantity: number }[] | null;
}

interface OrderStatsData {
  total: number;
  awaitingPayment: number;
  awaitingProduction: number;
  completed: number;
  totalRevenue: number;
}

const EMPTY_STATS: OrderStatsData = {
  total: 0,
  awaitingPayment: 0,
  awaitingProduction: 0,
  completed: 0,
  totalRevenue: 0,
};

function formatSender(order: Order) {
  if (order.identification_mode === "ANONYMOUS") return "Anônimo";
  if (order.sender_class === SENDER_NON_STUDENT_LABEL) {
    return `${order.sender_name} · ${SENDER_NON_STUDENT_LABEL}`;
  }
  return `${order.sender_name} · ${order.sender_class}`;
}

function statusVariant(status: string) {
  if (status === "COMPLETED") return "success" as const;
  if (status === "AWAITING_PAYMENT") return "warning" as const;
  return "default" as const;
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-rose-50">
          {Array.from({ length: 6 }).map((__, j) => (
            <td key={j} className="px-4 py-4">
              <div className="h-4 animate-pulse rounded-lg bg-rose-100/80" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStatsData>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("active");
  const [selected, setSelected] = useState<Order | null>(null);
  const [downloadingPolaroid, setDownloadingPolaroid] = useState(false);
  const [downloadingSpotifyCode, setDownloadingSpotifyCode] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    const { ok, data } = await fetchJson<{ orders: Order[]; stats: OrderStatsData }>(
      `/api/admin/orders?${params}`
    );
    if (ok && data) {
      setOrders(data.orders);
      setStats(data.stats ?? EMPTY_STATS);
    }
    setLoading(false);
  }, [q, status]);

  useEffect(() => {
    const t = setTimeout(fetchOrders, 300);
    return () => clearTimeout(t);
  }, [fetchOrders]);

  const updateStatus = async (id: string, newStatus: string) => {
    const { ok, data } = await fetchJson<{ order: Order }>(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (ok) {
      fetchOrders();
      if (selected?.id === id && data?.order) {
        setSelected(data.order);
      }
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.")) {
      return;
    }
    setDeleting(true);
    try {
      const { ok, error } = await fetchJson(`/api/admin/orders/${id}`, { method: "DELETE" });
      if (!ok) throw new Error(error ?? "Erro ao excluir.");
      setSelected(null);
      fetchOrders();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao excluir pedido.");
    } finally {
      setDeleting(false);
    }
  };

  const letterName = (id: string) =>
    LETTER_TYPES.find((l) => l.id === id)?.name ?? id;

  const extraLabel = (id: string) => EXTRAS.find((e) => e.id === id)?.name ?? id;

  const downloadFile = async (
    url: string,
    filename: string,
    onStart: () => void,
    onEnd: () => void
  ) => {
    onStart();
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Falha ao baixar.");
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      onEnd();
    }
  };

  const downloadPolaroid = (url: string, receiverName: string) => {
    const safeName = receiverName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    return downloadFile(
      url,
      `polaroid-${safeName || "pedido"}.jpg`,
      () => setDownloadingPolaroid(true),
      () => setDownloadingPolaroid(false)
    );
  };

  const downloadSpotifyCode = (spotifyLink: string, receiverName: string) => {
    const safeName = receiverName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const params = new URLSearchParams({ link: spotifyLink });
    return downloadFile(
      `/api/admin/spotify-code?${params}`,
      `spotify-code-${safeName || "pedido"}.png`,
      () => setDownloadingSpotifyCode(true),
      () => setDownloadingSpotifyCode(false)
    );
  };

  return (
    <div className="space-y-6">
      <OrderStats {...stats} loading={loading} />

      <div className="rounded-3xl border border-rose-100/80 bg-white/70 p-4 shadow-sm backdrop-blur-sm sm:p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted">
          <Filter className="h-4 w-4 text-rose-400" />
          Filtrar pedidos
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-300" />
            <Input
              className="h-11 rounded-2xl border-rose-100 bg-white pl-10"
              placeholder="Buscar por nome do destinatário ou remetente..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-11 w-full rounded-2xl border-rose-100 bg-white sm:w-56">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Em andamento</SelectItem>
              <SelectItem value="AWAITING_PAYMENT">Aguardando pagamento</SelectItem>
              <SelectItem value="AWAITING_PRODUCTION">Aguardando produção</SelectItem>
              <SelectItem value="COMPLETED">Finalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-rose-100/80 bg-white/70 shadow-sm backdrop-blur-sm">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-rose-100 bg-rose-50/60">
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-muted">
                    Data
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-muted">
                    Destinatário
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-muted">
                    Carta
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-muted">
                    Valor
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-muted">
                    Status
                  </th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody>
                <TableSkeleton />
              </tbody>
            </table>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-300">
              <Inbox className="h-7 w-7" />
            </span>
            <p className="mt-4 font-medium text-[#2a1a1f]">Nenhum pedido encontrado</p>
            <p className="mt-1 max-w-xs text-sm text-muted">
              {q || status !== "active"
                ? "Tente outro filtro ou termo de busca."
                : "Os pedidos aparecerão aqui quando os clientes finalizarem a compra."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-rose-100 bg-rose-50/60">
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-muted">
                    Data
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-muted">
                    Destinatário
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-muted">
                    Carta
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-muted">
                    Valor
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-muted">
                    Status
                  </th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="group border-b border-rose-50/80 transition hover:bg-rose-50/40"
                  >
                    <td className="px-4 py-4 text-muted tabular-nums">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-[#2a1a1f]">{order.receiver_name}</p>
                      <p className="text-xs text-muted">{order.receiver_class}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-800">
                        {letterName(order.letter_type)}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold tabular-nums text-rose-700">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={statusVariant(order.status)}>
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl opacity-70 transition group-hover:opacity-100"
                        onClick={() => setSelected(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#2a1a1f]/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-rose-100 bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-rose-50 bg-gradient-to-r from-rose-50/80 to-white px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
                  Detalhes do pedido
                </p>
                <h3 className="mt-1 text-xl font-bold text-[#2a1a1f]">
                  {selected.receiver_name}
                </h3>
                <p className="text-sm text-muted">{selected.receiver_class}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-muted transition hover:bg-rose-100 hover:text-[#2a1a1f]"
                  aria-label="Fechar"
                >
                  <X className="h-4 w-4" />
                </button>
                <Badge variant={statusVariant(selected.status)}>
                  {ORDER_STATUS_LABELS[selected.status] ?? selected.status}
                </Badge>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <dl className="grid gap-3 sm:grid-cols-2">
                <DetailField label="Carta">{letterName(selected.letter_type)}</DetailField>
                <DetailField label="Valor">
                  <span className="text-rose-600">
                    {formatCurrency(selected.total_amount)}
                  </span>
                </DetailField>
                <DetailField label="Destinatário" className="sm:col-span-2">
                  {selected.receiver_name} · {selected.receiver_class}
                </DetailField>
                <DetailField label="Remetente" className="sm:col-span-2">
                  {formatSender(selected)}
                </DetailField>
              </dl>

              <div className="mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Mensagem
                </p>
                <p className="mt-2 whitespace-pre-wrap rounded-2xl border border-rose-50 bg-rose-50/40 p-4 text-sm leading-relaxed text-[#2a1a1f]">
                  {selected.message}
                </p>
              </div>

              {selected.spotify_link && (() => {
                const spotifyCodeUrl = getSpotifyCodeImageUrl(selected.spotify_link);
                return (
                  <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-rose-50 bg-rose-50/20 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                      Spotify Code
                    </p>
                    {spotifyCodeUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={spotifyCodeUrl}
                          alt="Spotify Code da música"
                          className="mx-auto max-w-[280px] rounded-2xl border border-rose-100 bg-white p-4 shadow-sm"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="w-full rounded-xl sm:w-auto"
                          disabled={downloadingSpotifyCode}
                          onClick={() =>
                            downloadSpotifyCode(
                              selected.spotify_link!,
                              selected.receiver_name
                            )
                          }
                        >
                          {downloadingSpotifyCode ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          Baixar Spotify Code
                        </Button>
                      </>
                    ) : (
                      <p className="text-sm text-amber-800">
                        Link inválido para gerar o código.
                      </p>
                    )}
                    <a
                      href={selected.spotify_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block border-t border-rose-100 pt-4 text-xs text-rose-600 underline"
                    >
                      Abrir link original
                    </a>
                  </div>
                );
              })()}

              {selected.polaroid_url && (
                <div className="mt-4 rounded-2xl border border-rose-50 bg-rose-50/20 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    Polaroid
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selected.polaroid_url}
                    alt="Polaroid"
                    className="mt-3 max-h-56 w-full rounded-2xl object-cover shadow-sm"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="mt-3 w-full rounded-xl sm:w-auto"
                    disabled={downloadingPolaroid}
                    onClick={() =>
                      downloadPolaroid(selected.polaroid_url!, selected.receiver_name)
                    }
                  >
                    {downloadingPolaroid ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Baixar imagem
                  </Button>
                </div>
              )}

              {selected.extras && selected.extras.length > 0 && (
                <div className="mt-4">
                  <DetailField label="Adicionais">
                    {selected.extras
                      .map((e) => `${extraLabel(e.id)} × ${e.quantity}`)
                      .join(" · ")}
                  </DetailField>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-rose-50 bg-rose-50/30 px-6 py-4">
              {selected.status === "AWAITING_PRODUCTION" && (
                <Button
                  className="flex-1 rounded-2xl sm:flex-none"
                  onClick={() => updateStatus(selected.id, "COMPLETED")}
                >
                  Marcar como finalizado
                </Button>
              )}
              {selected.status === "AWAITING_PAYMENT" && (
                <Button
                  variant="secondary"
                  className="flex-1 rounded-2xl sm:flex-none"
                  onClick={() => updateStatus(selected.id, "AWAITING_PRODUCTION")}
                >
                  Confirmar pagamento
                </Button>
              )}
              <Button
                variant="destructive"
                className="flex-1 rounded-2xl sm:flex-none"
                disabled={deleting}
                onClick={() => deleteOrder(selected.id)}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Excluir pedido
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "rounded-2xl",
                  selected.status === "AWAITING_PAYMENT" ||
                    selected.status === "AWAITING_PRODUCTION"
                    ? "sm:flex-none"
                    : "w-full"
                )}
                onClick={() => setSelected(null)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
