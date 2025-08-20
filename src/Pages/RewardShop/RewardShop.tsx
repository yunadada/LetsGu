// src/Pages/RewardShop/RewardShop.tsx
import React, { useEffect, useMemo, useState } from "react";
import "./RewardsShop.css";
import { api } from "../../api/client";
import axios from "axios"; // ✅ isAxiosError 사용
import ExchangeSheet from "./ExchangeSheet"; // 경로 맞춰줘
import { useNavigate } from "react-router-dom";

interface Item {
  itemId: number;
  itemName: string;
  price: number;
  count: number;
}
interface ApiListRes {
  success: boolean;
  data: Item[];
}
interface ApiActionRes {
  success: boolean;
  code?: string;
  message?: string;
  data?: unknown;
}

const isVoucher = (name: string) => name.includes("상품권");

/** ✅ any 금지: 에러 메시지 안전 추출 */
type ServerErr = { message?: string };
const getAxiosMessage = (
  err: unknown,
  fallback = "네트워크 오류가 발생했습니다."
): string => {
  if (axios.isAxiosError<ServerErr>(err)) {
    return err.response?.data?.message ?? fallback;
  }
  return fallback;
};

const RewardShop: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [points, setPoints] = useState<number>(5000);
  const [tab, setTab] = useState<"voucher" | "partner">("voucher");

  // ✅ 드로어 상태
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<Item | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get<ApiListRes>("/api/v1/items", {
          headers: { Accept: "application/json" },
        });
        if (!mounted) return;
        if (data.success) {
          console.log("아이템:", data.data);
          setItems(data.data);
        } else setError("아이템을 불러오지 못했습니다.");
      } catch (err: unknown) {
        setError(getAxiosMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      items.filter((it) =>
        tab === "voucher" ? isVoucher(it.itemName) : !isVoucher(it.itemName)
      ),
    [items, tab]
  );

  const openExchange = (item: Item) => {
    setSelected(item);
    setSheetOpen(true);
  };

  const closeExchange = () => {
    setSheetOpen(false);
    setTimeout(() => setSelected(null), 240);
  };

  const submitExchange = async (count: number) => {
    if (!selected) return;

    try {
      const { data } = await api.post<ApiActionRes>(
        `/api/v1/items/${selected.itemId}`,
        { count },
        { headers: { "Content-Type": "application/json" } }
      );

      if (data.success) {
        setPoints((p) => p - selected.price * count);
        setItems((prev) =>
          prev.map((it) =>
            it.itemId === selected.itemId
              ? { ...it, count: it.count - count }
              : it
          )
        );
        // ✅ 성공 시 토스트 대신 모달만
        closeExchange();
        setSuccessOpen(true);
      } else {
        // ❗ 실패 시만 토스트
        setMessage(data.message || "교환 실패");
      }
    } catch (err: unknown) {
      // ❗ 네트워크/예외 에러도 토스트
      setMessage(getAxiosMessage(err, "교환 실패"));
    }
  };

  // 컴포넌트 상단쪽에 추가
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 2500); // 2.5초 후 자동 닫힘
    return () => clearTimeout(t);
  }, [message]);

  return (
    <div className="shop-container">
      {/* 헤더 */}
      <header className="shop-header">
        <div className="topbar">
          <button
            className="back-btn"
            onClick={() => window.history.back()}
            aria-label="뒤로가기"
          >
            <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M15 18L9 12l6-6"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className="shop-title">리워드 샵</h1>
          <div className="topbar-spacer" aria-hidden />
        </div>

        <nav className="tabs">
          <button
            className={`tab-btn ${tab === "voucher" ? "active" : ""}`}
            onClick={() => setTab("voucher")}
          >
            구미사랑상품권
          </button>
          <button
            className={`tab-btn ${tab === "partner" ? "active" : ""}`}
            onClick={() => setTab("partner")}
          >
            제휴 쿠폰
          </button>
        </nav>
      </header>

      {loading && <p className="meta">불러오는 중…</p>}
      {error && <p className="error">{error}</p>}

      {/* 그리드 */}
      <div className="card-grid">
        {filtered.map((item, idx) => {
          const voucher = isVoucher(item.itemName);
          const hot = tab === "voucher" && idx === 1;
          return (
            <div
              key={item.itemId}
              className={`card ${voucher ? "card-blue" : "card-plain"}`}
              onClick={() => openExchange(item)}
              role="button"
            >
              <div className="card-media">
                {voucher ? (
                  <div className="voucher-face">
                    <div className="voucher-title">구미사랑</div>
                    <div className="voucher-sub">
                      {item.itemName.replace("구미사랑상품권", "").trim()}
                    </div>
                  </div>
                ) : (
                  <div className="thumb">
                    <div className="note" />
                  </div>
                )}
                <div className="price-pill">
                  <span className="coin" />
                  {item.price.toLocaleString()}
                </div>
                {hot && <div className="hot-badge">HOT</div>}
              </div>

              <div className="card-body">
                <div className="card-name">{item.itemName}</div>
                <div className="card-meta">
                  {voucher
                    ? "전자상품권 · 구미사랑상품권"
                    : "제휴쿠폰 · 교환 가능"}
                </div>
                <div className="card-actions">
                  <button
                    className="btn-primary"
                    disabled={item.count <= 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      openExchange(item);
                    }}
                  >
                    {item.count > 0 ? "교환" : "품절"}
                  </button>
                  <span className="stock">재고 {Math.max(item.count, 0)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 성공 모달 */}
      {successOpen && (
        <div
          className="modal-root"
          onClick={() => setSuccessOpen(false)}
          aria-modal="true"
          role="dialog"
        >
          <div className="success-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="success-close"
              aria-label="닫기"
              onClick={() => setSuccessOpen(false)}
            >
              ×
            </button>
            <div className="success-illus" aria-hidden>
              🎁
            </div>
            <div className="success-title">교환 완료!</div>
            <div className="success-msg">
              교환이 바로 되었습니다.
              <br />
              교환한 상품은 내 지갑에서 확인해보세요.
            </div>
            <div className="success-actions">
              <button
                className="btn-ghost lg"
                onClick={() => {
                  setSuccessOpen(false);
                  // TODO: 홈 경로가 있다면 여기서 이동
                  navigate("/");
                }}
              >
                홈 화면으로
              </button>
              <button
                className="btn-ghost lg"
                onClick={() => {
                  setSuccessOpen(false);
                  navigate("/wallet");
                }}
              >
                내 지갑으로
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ✅ 분리된 컴포넌트만 사용 */}

      <ExchangeSheet
        open={sheetOpen}
        item={selected}
        points={points}
        onClose={closeExchange}
        onSubmit={submitExchange}
      />

      {message && (
        <div className="toast" onClick={() => setMessage(null)} role="status">
          {message}
        </div>
      )}
    </div>
  );
};

export default RewardShop;
