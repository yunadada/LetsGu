import style from "./InfoItem.module.css";

type Props = {
  label: string;
  value?: string;
};

const InfoItem = ({ label, value }: Props) => {
  return (
    <div className={style.container}>
      <p className={style.label}>{label}</p>
      {value ? <p>{value}</p> : ""}
    </div>
  );
};

export default InfoItem;
