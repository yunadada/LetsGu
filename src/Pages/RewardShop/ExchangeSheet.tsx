// src/Pages/RewardShop/ExchangeSheet.tsx
import React, { useMemo, useState } from "react";
import coin from "../../assets/coin.png";

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

  /** 교환 대상 */
  item: ExchangeItem;

  /** 보유 포인트 */
  myPoints: number;

  /** 상단 타입 라벨(피그마: '전자상품권 | ...') */
  typeLabel?: string; // 예: "전자상품권"

  /** 로딩 중이면 버튼/컨트롤 비활성화 */
  loading?: boolean;

  /** 이미지 섹션 노출 여부(피그마 기본 미노출) */
  showImage?: boolean;

  /** 최소/최대 수량(선택사항, 없으면 자동 계산) */
  minQty?: number;
  maxQtyOverride?: number;
}

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const ExchangeSheet: React.FC<ExchangeSheetProps> = ({
  open,
  onClose,
  onConfirm,
  item,
  myPoints,
  typeLabel,
  loading = false,
  showImage = false,
  minQty = 1,
  maxQtyOverride,
}) => {
  const unit = item.price;

  // 포인트/재고 기반 최대 수량 계산
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
    // 음수/NaN 방어
    return Number.isFinite(m) ? Math.max(m, 0) : 0;
  }, [maxByPoints, maxByStock, maxQtyOverride]);

  const [qty, setQty] = useState<number>(minQty);

  // 현재 수량을 허용 범위로 정규화
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

  return (
    <div
      className="xs-root"
      role="dialog"
      aria-modal="true"
      aria-label="교환 시트"
    >
      <div className="xs-panel">
        {/* 핸들/헤더 */}
        <div className="xs-handle" aria-hidden />
        <div className="xs-header">
          <div className="xs-title" style={{ lineHeight: 1.35 }}>
            {typeLabel ? `${typeLabel} | ${item.itemName}` : item.itemName}
          </div>
          <button
            type="button"
            className="xs-close"
            aria-label="닫기"
            onClick={onClose}
            disabled={loading}
            title="닫기"
          >
            ×
          </button>
        </div>

        {/* (옵션) 히어로 이미지: 피그마엔 없음, 필요 시만 표시 */}
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

        {/* 가격/단가 – 피그마에는 직접 표기되지 않지만 필요하면 노출 */}
        {/* <div className="xs-section">
          <div className="xs-price">개당 {unit.toLocaleString()} 리워드</div>
        </div> */}

        {/* 교환 수량 + 스테퍼 */}
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

          {/* 힌트/제약 표시 */}
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

        {/* 합계/총 개수 */}
        <div className="xs-section">
          <div className="xs-row">
            <div className="xs-qty">총 {safeQty}개</div>
            <div
              className="xs-total"
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <img
                src={coin}
                alt=""
                className="coin-img"
                style={{ width: 18, height: 18 }}
              />
              {total.toLocaleString()}
            </div>
          </div>
          {/* 포인트 부족 시 경고 색상 */}
          {total > myPoints && (
            <div className="xs-hint neg" role="alert">
              보유 포인트가 부족합니다. (보유 {myPoints.toLocaleString()}{" "}
              리워드)
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
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
