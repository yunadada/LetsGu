import style from "./EditProfile.module.css";
import Header from "../../components/Header/Header";
import Profile from "../../components/MyPage/Profile/Profile";
import InfoItem from "../../components/EditProfile/InfoItem/InfoItem";
import { useLocation, useNavigate } from "react-router-dom";
import type { UserProfileData } from "../../types/userInfo";

const EditProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userData: UserProfileData = location.state.userProfileData;

  const onLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <div className={style.wrapper}>
      <Header title="내 프로필" />
      <div className={style.contents}>
        <div className={style.profile}>
          <Profile imageUrl={userData.imageUrl} />
        </div>
        <div className={style.infoSection}>
          <InfoItem label="이름" value={userData.nickname} />
          <InfoItem label="이메일" value={userData.email} />
        </div>
        <div className={style.infoSection}>
          <InfoItem label="로그아웃" value="" handler={onLogout} />
          {/* <InfoItem label="회원탈퇴" /> */}
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
