import React from "react";
import "./Wallet.css";

export type RewardHistoryRow = {
  pointTransactionId: number;
  pointType: string; // "EXCHANGE" | "MISSION_SUCCESS" | "REVIEW_WRITE" ...
  changeAmount: number; // +/-
  balanceAfter: number;
  createdAt?: string; // ISO
  title?: string; // 서버에 제목이 있다면 사용(없어도 OK)
};

type Props = {
  open: boolean;
  onClose: () => void;
  rows: RewardHistoryRow[];
  loading?: boolean;
  err?: string | null;
};

const fmtDate = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
};

// 포인트 유형 → 아이콘/타이틀 (필요 시 여기에서 커스터마이즈)
const typeMeta = (t: string) => {
  switch (t) {
    case "EXCHANGE":
      return { icon: "🎁", title: "교환" };
    case "MISSION_SUCCESS":
      return { icon: "👍", title: "미션 성공" };
    case "REVIEW_WRITE":
      return { icon: "💗", title: "리뷰 작성" };
    default:
      return { icon: "🪙", title: t.replaceAll("_", " ") };
  }
};

const RewardHistorySheet: React.FC<Props> = ({
  open,
  onClose,
  rows,
  loading,
  err,
}) => {
  if (!open) return null;

  return (
    <div className="rhs-root" onClick={onClose} role="dialog" aria-modal="true">
      <div className="rhs-panel" onClick={(e) => e.stopPropagation()}>
        <div className="rhs-handle" />
        <div className="rhs-titlebar">
          <h3 className="rhs-title">리워드 내역</h3>
          <span className="rhs-range">최근 6개월</span>
        </div>

        {loading ? (
          <p className="meta" style={{ padding: "12px 16px" }}>
            불러오는 중…
          </p>
        ) : err ? (
          <p className="error" style={{ padding: "12px 16px" }}>
            {err}
          </p>
        ) : rows.length === 0 ? (
          <p className="meta" style={{ padding: "12px 16px" }}>
            표시할 내역이 없어요.
          </p>
        ) : (
          <ul className="rh-list">
            {rows.map((r) => {
              const { icon, title } = typeMeta(r.pointType);
              const pos = r.changeAmount >= 0;
              return (
                <li key={r.pointTransactionId} className="rh-item">
                  <div className="rh-left" aria-hidden>
                    {icon}
                  </div>

                  <div className="rh-mid">
                    <div className="rh-title">{r.title ?? title}</div>
                    <div className="rh-sub">{fmtDate(r.createdAt)}</div>
                  </div>

                  <div className="rh-right">
                    <div className={`rh-amount ${pos ? "pos" : "neg"}`}>
                      {pos ? "+" : ""}
                      {r.changeAmount.toLocaleString()} 리워드
                    </div>
                    <div className="rh-balance">
                      {r.balanceAfter.toLocaleString()} 리워드
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RewardHistorySheet;
