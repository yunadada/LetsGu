import style from "./Profile.module.css";
import defaultProfileImg from "../../../assets/defaultProfileImg.svg";

type Props = {
  imageUrl?: string;
};

const Profile = ({ imageUrl }: Props) => {
  const imgUrl = imageUrl;

  return (
    <div className={style.profile}>
      <img src={imgUrl ?? defaultProfileImg} alt="프로필 사진" loading="lazy" />
    </div>
  );
};

export default Profile;
