import React, { useEffect, useMemo, useState } from "react";
import "./RewardsShop.css";

type Item = {
  itemId: number;
  itemName: string;
  price: number;
  count: number; // 재고
  imageUrl?: string;
};

type Props = {
  open: boolean;
  item: Item | null;
  points: number;
  onClose: () => void;
  onSubmit: (count: number) => void;
};

const fmt = (n: number) => n.toLocaleString();

const ExchangeSheet: React.FC<Props> = ({
  open,
  item,
  points,
  onClose,
  onSubmit,
}) => {
  const [count, setCount] = useState(1);

  // 아이템 바뀔 때 초기화
  useEffect(() => {
    if (!item) return;
    setCount(Math.min(1, item.count) || 1);
  }, [item]);

  const max = useMemo(() => Math.max(1, item?.count ?? 1), [item?.count]);
  const total = useMemo(
    () => (item ? item.price * count : 0),
    [item, count]
  );
  const lack = total > points;

  if (!open || !item) return null;

  // 슬라이더 채움 비율(배경 표현용)
  const pct =
    max <= 1 ? 0 : Math.round(((count - 1) / (max - 1)) * 100);

  return (
    <div className="xs-root" role="dialog" aria-modal="true" onClick={onClose}>
      <div
        className="xs-panel"
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="xs-handle" />

        {/* 헤더 */}
        <div className="xs-header">
          <div className="xs-title">{item.itemName}</div>
          <button className="xs-close" aria-label="닫기" onClick={onClose}>
            ×
          </button>
        </div>

        {/* 썸네일 + 가격 */}
        <div className="xs-hero">
          {item.imageUrl ? (
            <img className="xs-img" src={item.imageUrl} alt="" />
          ) : (
            <div className="xs-img-fallback" />
          )}
          <div className="xs-price">
            개당 <strong>{fmt(item.price)}</strong> 리워드
          </div>
        </div>

        {/* 수량 슬라이더 */}
        <div className="xs-section">
          <div className="xs-row">
            <div className="xs-label">수량</div>
            <div className="xs-qty">{count}개</div>
          </div>

          <div className="xs-slider-wrap">
            {/* ➜ 슬라이더 우상단에 “보유 리워드” 배지 */}
            <div className="xs-points-pill">
              보유 <strong>{fmt(points)}</strong> 리워드
            </div>

            <input
              type="range"
              min={1}
              max={max}
              step={1}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="xs-range"
              style={
                {
                  // 진행도 채움(브라우저 기본 트랙 위에 덮는 기법)
                  // 일부 브라우저는 커스텀 트랙을 사용하므로, 기본값으로 둬도 동작 OK
                  "--fill": `${pct}%`,
                } as React.CSSProperties
              }
            />

            <div className="xs-slider-scale">
              <span>1</span>
              <span>{max}</span>
            </div>
          </div>
        </div>

        {/* 합계 */}
        <div className="xs-section">
          <div className="xs-row">
            <div className="xs-label">합계</div>
            <div className={`xs-total ${lack ? "neg" : ""}`}>
              {fmt(total)} 리워드
            </div>
          </div>
          {lack && (
            <div className="xs-hint neg">포인트가 부족해요.</div>
          )}
        </div>

        {/* 액션 */}
        <div className="xs-actions">
          <button className="btn-ghost" onClick={onClose}>
            취소
          </button>
          <button
            className="btn-primary"
            disabled={lack || count < 1}
            onClick={() => onSubmit(count)}
          >
            교환하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExchangeSheet;
