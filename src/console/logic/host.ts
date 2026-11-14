// What a screen's logic module may use of the console (audit WEB-ARCH-001). Console.tsx builds one ConsoleHost
// (its `host` field) and passes it to the modules in this folder; they never reach into the class otherwise.
// A module holds one screen's loaders, actions and renderVals() values; the state stays in Console.tsx.
import type GC_API from "../api";
import type { BulkOptions, ModalSpec, SelId, SelKey, SelView, State } from "../model";

/** A state change, as for React's setState: the changed keys, or a function of the current state. */
export type StateUpdate = Partial<State> | null | ((s: Readonly<State>) => Partial<State> | null);

export interface ConsoleHost {
  /** The console's current state (read it at the moment you need it: it changes after every setState). */
  readonly state: Readonly<State>;
  setState(update: StateUpdate, then?: () => void): void;
  /** Every server call goes through this (src/console/api.ts). */
  readonly api: typeof GC_API;
  /** Tags a request for one list or panel; the check returned is false once a newer request for it started. */
  ticket(key: string): () => boolean;
  toast(text: string, dot?: string): void;
  /** The single error handler: session end, password change, or a toast with the server's message. */
  fail(e: unknown): void;
  /** Opens the confirm dialog. */
  ask(modal: ModalSpec): void;
  /** A date and time in India time as the console shows it: "13 Nov 2026 09:15", or "13 Nov 09:15" when withYear is false. */
  fmt(iso: string | null | undefined, withYear?: boolean): string;
  /** Runs `run` after `ms` unless called again with the same key first (search boxes). Sign-out cancels it. */
  later(key: string, run: () => void, ms: number): void;
  /** Loads the geography tree (district, mandal and village pickers). */
  loadGeo(): void;
  /** Ticks or unticks one row for the bulk bar. */
  toggleSel(key: SelKey, id: SelId): void;
  /** The bulk bar's values for a list's ticked rows. */
  selView(key: SelKey, ids: SelId[], options: (n: number) => BulkOptions): SelView;
}
