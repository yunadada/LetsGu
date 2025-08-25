// src/Pages/RewardShop/ExchangeSheet.tsx
import React, { useMemo, useRef, useState } from "react";
import Coin from "../../assets/Coin.svg";

export interface ExchangeItem {
  itemId: number;
  itemName: string;
  price: number; // 개당 포인트
  imageUrl?: string;
  stock?: number | null; // 재고 없으면 null/undefined
}

interface ExchangeSheetProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (qty: number) => void | Promise<void>;
  item: ExchangeItem;
  myPoints: number;
  typeLabel?: string;
  loading?: boolean;
  showImage?: boolean;
  minQty?: number;
  maxQtyOverride?: number;
}

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const DRAG_CLOSE_THRESHOLD = 120; // px
const MAX_BACKDROP_OPACITY = 0.4;

const ExchangeSheet: React.FC<ExchangeSheetProps> = ({
  open,
  onClose,
  onConfirm,
  item,
  myPoints,
  
  loading = false,
  showImage = false,
  minQty = 1,
  maxQtyOverride,
}) => {
  // -------- 드래그 상태 --------
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startYRef = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const onPointerDown: React.PointerEventHandler = (e) => {
    if (loading) return;
    startYRef.current = e.clientY;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove: React.PointerEventHandler = (e) => {
    if (!dragging || startYRef.current == null) return;
    const dy = e.clientY - startYRef.current;
    // 위로 끌면 무시, 아래로만 이동
    setDragY(Math.max(0, dy));
  };

  const finishDrag = () => {
    if (!dragging) return;
    if (dragY > DRAG_CLOSE_THRESHOLD) {
      onClose();
    }
    // 스냅백
    setDragging(false);
    setDragY(0);
  };

  const onPointerUp: React.PointerEventHandler = () => finishDrag();
  const onPointerCancel: React.PointerEventHandler = () => finishDrag();

  // -------- 수량/검증 --------
  const unit = item.price;
  const maxByPoints = unit > 0 ? Math.floor(myPoints / unit) : 0;
  const maxByStock =
    typeof item.stock === "number" && item.stock >= 0
      ? item.stock
      : Number.POSITIVE_INFINITY;
  const computedMax = useMemo(() => {
    const baseMax = Math.min(maxByPoints, maxByStock);
    const byOverride =
      typeof maxQtyOverride === "number"
        ? maxQtyOverride
        : Number.POSITIVE_INFINITY;
    const m = Math.min(baseMax, byOverride);
    return Number.isFinite(m) ? Math.max(m, 0) : 0;
  }, [maxByPoints, maxByStock, maxQtyOverride]);

  const [qty, setQty] = useState<number>(minQty);
  const safeQty = useMemo(
    () => clamp(qty, minQty, Math.max(computedMax, minQty)),
    [qty, minQty, computedMax]
  );
  const total = safeQty * unit;
  const canSubmit =
    computedMax > 0 && safeQty >= minQty && total <= myPoints && !loading;

  const handleMinus = () =>
    setQty((q) => clamp(q - 1, minQty, Math.max(computedMax, minQty)));
  const handlePlus = () =>
    setQty((q) => clamp(q + 1, minQty, Math.max(computedMax, minQty)));
  const handleConfirm = async () => {
    if (!canSubmit) return;
    await onConfirm(safeQty);
  };

  if (!open) return null;

  // -------- 스타일 계산(드래그에 따라 패널/백드롭 갱신) --------
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
      className="xs-root"
      role="dialog"
      aria-modal="true"
      aria-label="교환 시트"
    >
      {/* 백드롭 */}
      <div
        className="xs-backdrop"
        style={{ opacity: backdropOpacity }}
        onClick={() => !loading && onClose()}
      />

      {/* 패널 */}
      <div
        ref={panelRef}
        className={`xs-panel ${dragging ? "dragging" : ""}`}
        style={panelStyle}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        {/* 핸들/헤더 */}
        <div
          className="xs-handle"
          onPointerDown={onPointerDown}
          role="button"
          aria-label="드래그하여 닫기"
          tabIndex={0}
        />
        <div className="xs-header">
          <div className="xs-title" style={{ lineHeight: 1.35 }}>
            {item.itemName}
          </div>
          {/* <button
            type="button"
            className="xs-close"
            aria-label="닫기"
            onClick={onClose}
            disabled={loading}
            title="닫기"
          >
            ×
          </button> */}
        </div>

        {/* (옵션) 이미지 */}
        {showImage &&
          (item.imageUrl ? (
            <div className="xs-hero" aria-hidden={false}>
              <img src={item.imageUrl} alt="" className="xs-img" />
            </div>
          ) : (
            <div className="xs-hero" aria-hidden={false}>
              <div className="xs-img-fallback" />
            </div>
          ))}

        {/* 수량 */}
        <div className="xs-section">
          <div className="xs-row" style={{ alignItems: "center" }}>
            <div className="xs-label">교환 수량</div>

            <div className="qty-control" aria-label="수량 선택">
              <button
                type="button"
                className="qc-btn minus"
                onClick={handleMinus}
                disabled={loading || safeQty <= minQty}
                aria-label="수량 감소"
              />
              <div className="qc-value" aria-live="polite">
                {safeQty}
              </div>
              <button
                type="button"
                className="qc-btn plus"
                onClick={handlePlus}
                disabled={loading || safeQty >= computedMax}
                aria-label="수량 증가"
              />
            </div>
          </div>

          {computedMax <= 0 && (
            <div className="xs-hint neg" role="alert">
              보유 포인트가 부족하거나 재고가 없습니다.
            </div>
          )}
          {computedMax > 0 && safeQty > computedMax && (
            <div className="xs-hint neg" role="alert">
              최대 {computedMax}개까지 교환할 수 있어요.
            </div>
          )}
        </div>

        {/* 합계 */}
        <div className="xs-section">
          <div className="xs-row">
            <div className="xs-qty">총 {safeQty}개</div>
            <div
              className="xs-total"
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <img
                src={Coin}
                alt=""
                className="coin-img"
                style={{ width: 18, height: 18 }}
              />
              {total.toLocaleString()}
            </div>
          </div>
          {total > myPoints && (
            <div className="xs-hint neg" role="alert">
              보유 포인트가 부족합니다. (보유 {myPoints.toLocaleString()}{" "}
              리워드)
            </div>
          )}
        </div>

        {/* 액션 */}
        <div className="xs-actions">
          <button
            type="button"
            className="btn-ghost"
            onClick={onClose}
            disabled={loading}
          >
            취소하기
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleConfirm}
            disabled={!canSubmit}
          >
            {loading ? "처리 중..." : "교환하기"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExchangeSheet;
