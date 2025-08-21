import style from "./EmptyText.module.css";

type Props = {
  type: "written" | "unwritten";
};

const texts = {
  unwritten: {
    first: "아직 작성 가능한 리뷰가 없어요.",
    second: (
      <>
        <span>미션을 완료</span>하고 <span>리뷰를 작성</span>해 보세요!
      </>
    ),
  },
  written: {
    first: "아직 작성한 리뷰가 없어요.",
    second: (
      <>
        <span>리뷰를 작성</span>하고 <span>리워드</span>를 받아보세요!
      </>
    ),
  },
};

const EmptyText = ({ type }: Props) => {
  const { first, second } = texts[type];
  return (
    <div className={style.container}>
      <p>{first}</p>
      <p>{second}</p>
    </div>
  );
};

export default EmptyText;
