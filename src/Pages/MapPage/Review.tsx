import React from "react";
import duck from '../../assets/duck.png'

export const ReviewHero: React.FC = () => (
  <div className="review-hero">
    <p className="review-hero__text">
      리뷰를 남기고 <strong>리워드</strong>를 받아보세요!
    </p>
    <img className="review-hero__duck" src={duck} alt="" />
  </div>
);


