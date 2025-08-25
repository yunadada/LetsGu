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
    case "REVIEW":
      return { icon: <img src={Heart3D} alt="" />, title: "리뷰 작성" };
    default:
      return {
        icon: <span aria-hidden="true">🪙</span>,
        title: T.replaceAll("_", " "),
      };
  }
};

/** 드래그 UX 상수 (ExchangeSheet와 동일) */
const DRAG_CLOSE_THRESHOLD = 120; // px
const MAX_BACKDROP_OPACITY = 0.4;

const RewardHistorySheet: React.FC<Props> = ({
  open,
  onClose,
  rows,
  loading,
  err,
}) => {
  // ✅ 최신순(역순) 정렬: createdAt 내림차순 → 동률이면 id 내림차순
  const sortedRows = React.useMemo(() => {
    const toTs = (s?: string) => {
      const t = s ? new Date(s).getTime() : 0;
      return Number.isFinite(t) ? t : 0;
    };
    return [...rows].sort((a, b) => {
      const diff = toTs(b.createdAt) - toTs(a.createdAt);
      if (!Number.isFinite(diff) || diff === 0) {
        return (b.pointTransactionId ?? 0) - (a.pointTransactionId ?? 0);
      }
      return diff;
    });
  }, [rows]);

  // ====== 드래그 상태 (디자인 유지, 로직만 추가) ======
  const [dragY, setDragY] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const startYRef = React.useRef<number | null>(null);

  const onPointerDown: React.PointerEventHandler = (e) => {
    if (loading) return;
    startYRef.current = e.clientY;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove: React.PointerEventHandler = (e) => {
    if (!dragging || startYRef.current == null) return;
    const dy = e.clientY - startYRef.current;
    setDragY(Math.max(0, dy)); // 위로 끌기 무시, 아래로만
  };
  const finishDrag = () => {
    if (!dragging) return;
    if (dragY > DRAG_CLOSE_THRESHOLD) onClose();
    setDragging(false);
    setDragY(0); // 스냅백
  };
  const onPointerUp: React.PointerEventHandler = () => finishDrag();
  const onPointerCancel: React.PointerEventHandler = () => finishDrag();

  if (!open) return null;

  // 패널/백드롭 인라인 스타일 (기존 클래스 유지)
  const panelStyle: React.CSSProperties = {
    transform: `translateY(${dragY}px)`,
    transition: dragging ? "none" : "transform 200ms ease",
    
  };
  const backdropOpacity = Math.max(
    0,
    MAX_BACKDROP_OPACITY * (1 - Math.min(dragY / 300, 1))
  );

  return (
       <div
      className="rhs-root"
      role="dialog"
      aria-modal="true"
    onClick={onClose}
    style={{ backgroundColor: `rgba(0,0,0,${backdropOpacity})` }}
  >

      <div
        className={`rhs-panel ${dragging ? "dragging" : ""}`}
        style={panelStyle}
        onClick={(e) => e.stopPropagation()}
        role="document"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <div
          className="rhs-handle"
          onPointerDown={onPointerDown}
          role="button"
          aria-label="드래그하여 닫기"
          tabIndex={0}
        />
        <div className="rhs-titlebar">
          <h3 className="rhs-title">리워드 내역</h3>
          <span className="rhs-range">최근 6개월</span>
        </div>

        {loading ? (
          <p className="meta rhs-meta-pad">불러오는 중…</p>
        ) : err ? (
          <p className="error rhs-meta-pad">{err}</p>
        ) : sortedRows.length === 0 ? (
          <p className="meta rhs-meta-pad">표시할 내역이 없어요.</p>
        ) : (
          <ul className="rh-list">
            {sortedRows.map((r) => {
              const { icon, title } = typeMeta(r.pointType);
              const pos = r.changeAmount >= 0;
              const highlight = false;

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
