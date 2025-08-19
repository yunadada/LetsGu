import React, { useState, useRef } from "react";
import "./BottomSlider.css";

interface Props {
  
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  sliderLevel: "closed" | "half" | "full";
  setSliderLevel: React.Dispatch<React.SetStateAction<"closed" | "half" | "full">>;
}

const THRESH = 100; // 드래그 임계값(px)

const BottomSlider: React.FC<Props> = ({
  
  children,
  isOpen,
  onClose,
  onOpen,
  sliderLevel,
  setSliderLevel,
}) => {
  const [dragY, setDragY] = useState(0);
  const startY = useRef<number | null>(null);

  const openHalf = () => {
    onOpen?.();
    setSliderLevel("half");
  };
  const openFull = () => {
    onOpen?.();
    setSliderLevel("full");
  };
  const closeSheet = () => {
    setSliderLevel("closed");
    onClose();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    setDragY(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null) return;
    const deltaY = e.touches[0].clientY - startY.current;
    setDragY(deltaY);
  };

  const handleTouchEnd = () => {
    if (startY.current === null) return;
    const dy = dragY;

    // 스와이프 업(열기 방향)
    if (dy <= -THRESH) {
      if (sliderLevel === "closed") openHalf();
      else if (sliderLevel === "half") openFull();
      // full에서 위로는 변화 없음
    }
    // 스와이프 다운(닫기/축소 방향)
    else if (dy >= THRESH) {
      if (sliderLevel === "full") setSliderLevel("half");
      else if (sliderLevel === "half") closeSheet();
      // closed에서 아래로는 변화 없음
    }
    // 임계 미만: 유지
    setDragY(0);
    startY.current = null;
  };

  return (
    <>
      {/* backdrop */}
      {isOpen && <div className="bs-backdrop" onClick={closeSheet} />}

      {/* slider: 단계 클래스를 함께 부여 */}
      <div className={`bs-sheet ${isOpen ? "open" : ""} ${sliderLevel}`}>
        <div
          className="bs-grab"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="bs-bar" />
          
        </div>

        <div className="bs-content">{children}</div>
        <div className="bs-safe" />
      </div>
    </>
  );
};

export default BottomSlider;
