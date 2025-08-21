// src/Pages/RewardShop/ExchangeSheet.tsx
import React, { useEffect, useMemo, useState } from "react";
import coin from "../../assets/coin.png";

type SheetItem = {
  itemId: number;
  itemName: string;
  price: number;
  count: number; // 재고
  imageUrl?: string;
};

type Props = {
  open: boolean;
  item: SheetItem | null;
  points: number;
  onClose: () => void;
  onSubmit: (count: number) => void;
};

const ExchangeSheet: React.FC<Props> = ({
  open,
  item,
  points,
  onClose,
  onSubmit,
}) => {
  const [qty, setQty] = useState(1);

  // 실제 재고와 최대 선택 수량 분리
  const stock = Math.max(0, item?.count ?? 0);
  const maxQty = Math.max(1, stock);

  const clamp = (n: number) => Math.min(Math.max(n, 1), maxQty);

  const total = useMemo(() => (item ? item.price * qty : 0), [item, qty]);

  const outOfStock = stock <= 0;
  const notEnough = !outOfStock && total > points;

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(maxQty, q + 1));

  // 아이템 변경 시 수량 보정/초기화
  useEffect(() => {
    setQty((q) => clamp(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.itemId, stock]);

  if (!open || !item) return null;

  return (
    <div
      className="drawer-root"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="drawer-panel open"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        {/* 드래그 핸들 */}
        <div className="drawer-handle" aria-hidden />

        {/* 헤더: 썸네일 + 텍스트 */}
        <div className="sheet-header">
          <div className="sheet-thumb" aria-hidden>
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt=""
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : (
              <div className="sheet-thumb-fallback" />
            )}
          </div>
          <div className="sheet-head-right">
            <div className="sheet-title">{item.itemName}</div>
            <div className="sheet-price">
              <img src={coin} alt="" className="coin-img" aria-hidden />
              {item.price.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 수량 컨트롤 */}
        <div className="drawer-row">
          <div className="drawer-label">교환 수량</div>
          <div className="qty-control" role="group" aria-label="수량 선택">
            <button
              className="qc-btn minus"
              onClick={dec}
              disabled={outOfStock || qty <= 1}
              aria-label="수량 줄이기"
            />
            <span className="qc-value" aria-live="polite">
              {qty}
            </span>
            <button
              className="qc-btn plus"
              onClick={inc}
              disabled={outOfStock || qty >= stock}
              aria-label="수량 늘리기"
            />
          </div>
        </div>

        {/* 재고/합계 */}
        <div className="qty-meta-row">
          <span className="qty-stock">재고 {stock.toLocaleString()}</span>
          <span className="qty-total"></span>
        </div>

        {/* 총합 섹션 */}
        <div className="drawer-total">
          <div className="drawer-total-left">총 {qty} 개</div>
          <div className="drawer-total-amt">
            <img src={coin} alt="" className="coin-img" aria-hidden />
            {total.toLocaleString()}
          </div>
        </div>

        {/* 경고 메시지 */}
        {outOfStock && <div className="error-inline">재고가 없습니다.</div>}
        {!outOfStock && notEnough && (
          <div className="error-inline">포인트가 부족합니다.</div>
        )}

        {/* 액션 버튼 */}
        <div className="sheet-actions">
          <button className="btn-secondary btn-block" onClick={onClose}>
            취소하기
          </button>
          <button
            className="btn-orange btn-block"
            disabled={outOfStock || notEnough}
            onClick={() => onSubmit(qty)}
          >
            교환하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExchangeSheet;
