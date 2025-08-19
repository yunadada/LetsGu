import style from "./Profile.module.css";
import ProfileImg from "../../../assets/ProfileImg.svg";

const Profile = () => {
  return (
    <div className={style.profile}>
      <img src={ProfileImg} alt="사진" />
    </div>
  );
};

export default Profile;
