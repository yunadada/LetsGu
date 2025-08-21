import style from "./InfoItem.module.css";

type Props = {
  label: string;
  value?: string;
  handler?: () => void;
};

const InfoItem = ({ label, value, handler }: Props) => {
  return (
    <div className={style.container}>
      <p className={style.label} onClick={handler}>
        {label}
      </p>
      {value ? <p>{value}</p> : ""}
    </div>
  );
};

export default InfoItem;
