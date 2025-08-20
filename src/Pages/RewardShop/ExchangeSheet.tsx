// src/Pages/RewardShop/ExchangeSheet.tsx
import React, { useEffect, useMemo, useState } from "react";
import "./RewardsShop.css";

export interface ExchangeItem {
  itemId: number;
  itemName: string;
  price: number;
  count: number;
}

interface Props {
  open: boolean;
  item: ExchangeItem | null;
  points: number;
  initialQty?: number;
  onClose: () => void;
  onSubmit: (count: number) => void | Promise<void>;
}

/** ✅ 얇은 래퍼: 훅 호출 없음 -> 조건부 렌더 OK */
const ExchangeSheet: React.FC<Props> = (props) => {
  if (!props.open || !props.item) return null;
  return <ExchangeSheetInner {...props} item={props.item} />;
};

export default ExchangeSheet;

/** ✅ 내부 컴포넌트: 여기서만 훅 사용 (항상 렌더됨) */
function ExchangeSheetInner({
  item,
  points,
  initialQty = 1,
  onClose,
  onSubmit,
}: Omit<Props, "open"> & { item: ExchangeItem }) {
  const [qty, setQty] = useState(initialQty);

  useEffect(() => {
    setQty(initialQty);
  }, [initialQty, item.itemId]);

  const maxQty = useMemo(() => {
    const maxByPoints = Math.floor(points / item.price);
    return Math.max(0, Math.min(item.count, maxByPoints));
  }, [item.count, item.price, points]);

  const total = useMemo(() => item.price * qty, [item.price, qty]);
  const atMax = qty === maxQty && maxQty > 0;

  const dec = () => setQty((n) => Math.max(1, n - 1));
  const inc = () => setQty((n) => Math.min(maxQty, n + 1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = async () => {
    if (qty < 1 || qty > maxQty) return;
    await onSubmit(qty);
  };

  return (
    <div className="drawer-root" onClick={onClose} aria-modal>
      <div className="drawer-panel open" role="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-handle" />
        <div className="drawer-title">{item.itemName}</div>

        <div className="drawer-row">
          <div className="drawer-label">교환 수량</div>
          <div className="drawer-stepper">
            <button className="drawer-step" onClick={dec} disabled={qty <= 1} aria-label="감소">−</button>
            <div className="drawer-qty" aria-live="polite">{qty}</div>
            <button className="drawer-step" onClick={inc} disabled={qty >= maxQty} aria-label="증가">+</button>
          </div>
        </div>

        <div className="drawer-row drawer-total">
          <div className="drawer-total-left">총 {qty}개</div>
          <div className="drawer-total-right">
            <div className="price-pill"><span className="coin" />{total.toLocaleString()}</div>
            {atMax && <div className="error-msg">아직 내가 가진 리워드가 부족해요.</div>}
          </div>
        </div>

        <div className="drawer-actions">
          <button className="btn-secondary lg" onClick={onClose}>취소하기</button>
          <button className="btn-orange lg" onClick={handleSubmit} disabled={qty < 1 || qty > maxQty}>
            교환하기
          </button>
        </div>
      </div>
    </div>
  );
}
