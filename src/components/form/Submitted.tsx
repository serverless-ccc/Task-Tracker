import { Button } from "antd";
import Confetti from "react-confetti";

import submit from "../../assets/submit.svg";

import { useWindowSize } from "react-use";

const Submitted = () => {
  const { width, height } = useWindowSize();

  return (
    <div className="container mx-auto px-4 mt-16">
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={1000}
      />
      <div className="grid grid-cols-2">
        <div className="col-span-2 xl:col-span-1 flex flex-col justify-evenly">
          <p className="xl:text-6xl text-2xl font-bold">Thank You</p>
          <Button
            size="large"
            type="default"
            onClick={() => (window.location.href = "/")}
            className="block w-fit mt-6"
          >
            Back To Home
          </Button>
        </div>
        <div className="col-span-2 xl:col-span-1 flex justify-center items-center">
          <img src={submit} alt="logo" className="mt-16 max-w-[400px]" />
        </div>
      </div>
    </div>
  );
};

export default Submitted;
