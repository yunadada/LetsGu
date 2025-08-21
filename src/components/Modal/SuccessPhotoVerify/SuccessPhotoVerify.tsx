import style from "./SuccessPhotoVerify.module.css";
import { FiCheck } from "react-icons/fi";
import ConfettiExplosion from "react-confetti-explosion";
import { useNavigate } from "react-router-dom";

const SuccessPhotoVerify = () => {
  const navigate = useNavigate();

  return (
    <div className={style.modalOverlay}>
      <div className={style.wrapper}>
        <div className={style.checkIcon}>
          <FiCheck />
        </div>
        <h4>미션 인증 완료!</h4>
        <p>
          <strong>+100 리워드</strong>를 적립해드렸어요.
        </p>
        <div className={style.button}>
          <button onClick={() => navigate("/map")}>미션 지도로 이동</button>
          <button onClick={() => navigate("/reviewWrite")}>리뷰 쓰기</button>
        </div>
      </div>
      <div className={style.confetti}>
        <ConfettiExplosion
          force={0.7}
          duration={2500}
          particleCount={80}
          width={1100}
        />
      </div>
    </div>
  );
};

export default SuccessPhotoVerify;
