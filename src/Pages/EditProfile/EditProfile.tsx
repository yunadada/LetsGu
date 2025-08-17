import style from "./EditProfile.module.css";
import Header from "../../components/Header/Header";
import Profile from "../../components/MyPage/Profile/Profile";
import InfoItem from "../../components/EditProfile/InfoItem/InfoItem";

const EditProfile = () => {
  return (
    <div className={style.wrapper}>
      <Header title="내 프로필" />
      <div className={style.contents}>
        <div className={style.profile}>
          <Profile />
        </div>
        <div className={style.infoSection}>
          <InfoItem label="이름" value="사용자" />
          <InfoItem label="이메일" value="user@naver.com" />
        </div>
        <div className={style.infoSection}>
          <InfoItem label="로그아웃" />
          <InfoItem label="회원탈퇴" />
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
