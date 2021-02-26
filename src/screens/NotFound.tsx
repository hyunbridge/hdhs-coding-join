import { useHistory } from "react-router-dom";
import "./App.css";

const NotFoundPage = () => {
  const history = useHistory();

  const handleClick = async () => {
    history.push("/");
  };

  return (
    <div className="warp py-5 text-center">
      <h1 className="title fw-bold">페이지를 찾을 수 없음</h1>
      <button
        className="btn btn-dark btn-lg btn-primary btn-block mt-4"
        type="button"
        id="applyButton"
        onClick={handleClick}
      >
        홈으로 가기
      </button>
    </div>
  );
};

export default NotFoundPage;
