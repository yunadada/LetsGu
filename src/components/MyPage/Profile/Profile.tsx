import style from "./Profile.module.css";

type Props = {
  imageUrl?: string;
};

const Profile = ({ imageUrl }: Props) => {
  const imgUrl = imageUrl;

  return (
    <div className={style.profile}>
      <img src={imgUrl} alt="사진" />
    </div>
  );
};

export default Profile;
