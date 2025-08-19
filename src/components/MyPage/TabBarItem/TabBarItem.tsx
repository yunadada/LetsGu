import style from "./TabBarItem.module.css";

type Props = {
  img: string;
  text: string;
};

const TabBarItem = ({ img, text }: Props) => {
  return (
    <div className={style.container}>
      <div className={style.circle}>
        <img src={img} />
      </div>
      <p>{text}</p>
    </div>
  );
};

export default TabBarItem;
