// RewardHistorySheet.tsx
import React from "react";
import "./Wallet.css";
import Giftbox from "../../assets/Giftbox.png";
import Bag3D from "../../assets/b3D.png";
import Heart3D from "../../assets/Heart3D.png";

export type RewardHistoryRow = {
  pointTransactionId: number;
  pointType: string;
  changeAmount: number;
  balanceAfter: number;
  createdAt?: string;
  title?: string;
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

const typeMeta = (t: string): { icon: React.ReactNode; title: string } => {
  const T = t.toUpperCase();
  switch (T) {
    case "GIFT_CARD_EXCHANGE":
      return {
        icon: <img src={Giftbox} alt="" />,
        title: "구미사랑상품권 교환",
      };
    case "PARTNER_ITEM_EXCHANGE":
      return { icon: <img src={Giftbox} alt="" />, title: "제휴 쿠폰 교환" };
    case "MISSION_SUCCESS":
      return { icon: <img src={Bag3D} alt="" />, title: "미션 성공" };
    case "REVIEW_WRITE":
      return { icon: <img src={Heart3D} alt="" />, title: "리뷰 작성" };
    default:
      return {
        icon: <span aria-hidden="true">🪙</span>,
        title: T.replaceAll("_", " "),
      };
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
    <div className="rhs-root" role="dialog" aria-modal="true" onClick={onClose}>
      <div
        className="rhs-panel"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="rhs-handle" />
        <div className="rhs-titlebar">
          <h3 className="rhs-title">리워드 내역</h3>
          <span className="rhs-range">최근 6개월</span>
        </div>

        {loading ? (
          <p className="meta rhs-meta-pad">불러오는 중…</p>
        ) : err ? (
          <p className="error rhs-meta-pad">{err}</p>
        ) : rows.length === 0 ? (
          <p className="meta rhs-meta-pad">표시할 내역이 없어요.</p>
        ) : (
          <ul className="rh-list">
            {rows.map((r) => {
              const { icon, title } = typeMeta(r.pointType);
              const pos = r.changeAmount >= 0;

              // 필요 시 강조(안쪽 점선 테두리) 조건을 여기에 넣으세요.
              const highlight = false; // 예: r.pointTransactionId === selectedId

              return (
                <li
                  key={r.pointTransactionId}
                  className={`rh-item${highlight ? " highlight" : ""}`}
                >
                  <div className="rh-left" aria-hidden>
                    <span className="rh-icon">{icon}</span>
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
