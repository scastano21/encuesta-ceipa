"use client";

type Props = {
  online: boolean;
  total: number;
  pendientes: number;
  syncing: boolean;
  lastMessage: string | null;
  onSync: () => void;
  onExport: () => void;
};

export function SyncBanner({
  online,
  total,
  pendientes,
  syncing,
  lastMessage,
  onSync,
  onExport,
}: Props) {
  return (
    <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                online ? "bg-emerald-500" : "bg-slate-400"
              }`}
              aria-hidden
            />
            <span className={online ? "text-emerald-700" : "text-slate-600"}>
              {online ? "Conectado" : "Sin conexión"}
            </span>
            {syncing && (
              <span className="text-xs font-normal text-ceipa-600">
                Sincronizando…
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600">
            {total} encuesta{total === 1 ? "" : "s"} guardada
            {total === 1 ? "" : "s"} localmente, {pendientes} pendiente
            {pendientes === 1 ? "" : "s"} por sincronizar
          </p>
          {lastMessage && (
            <p className="text-xs text-slate-500">{lastMessage}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSync}
            disabled={!online || syncing}
            title={
              !online
                ? "Sin conexión"
                : pendientes === 0
                  ? "No hay pendientes; puedes forzar una verificación"
                  : `Sincronizar ${pendientes} pendiente(s)`
            }
            className="rounded-lg bg-ceipa-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-ceipa-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sincronizar ahora
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={total === 0}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Exportar respaldo a Excel
          </button>
        </div>
      </div>
    </div>
  );
}
