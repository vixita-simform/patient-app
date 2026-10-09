import type { ClientCode } from "../../../../types";

export interface ClientCodeRowProps {
  client: ClientCode;
  active: boolean;
  /** Called with this row's client when pressed. */
  onSelect: (client: ClientCode) => void;
}
