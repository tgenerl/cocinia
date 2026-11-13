import { expiryStatus } from "../utils/helpers";
import { classNames } from "../utils/helpers";

const STYLES = {
  caducado: "bg-red-100 text-red-700",
  urgente: "bg-red-50 text-red-600",
  pronto: "bg-clay-100 text-clay-700",
  ok: "bg-sage-100 text-sage-700",
};

export default function ExpiryBadge({ date, className }) {
  const status = expiryStatus(date);
  return (
    <span className={classNames("rounded-full px-2.5 py-1 text-xs font-semibold", STYLES[status.level], className)}>
      {status.label}
    </span>
  );
}
