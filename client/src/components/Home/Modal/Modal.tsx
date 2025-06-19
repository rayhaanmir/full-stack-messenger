import { useEffect, useRef } from "react";
import "./Modal.css";

interface ModalProps {
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  modalText: string;
  blockPointer?: boolean;
  color?: string;
  fontSize?: string;
  center?: boolean;
  dimScreen: boolean;
}

const Modal = ({
  setIsOpen,
  modalText,
  blockPointer,
  color,
  fontSize,
  center,
  dimScreen,
}: ModalProps) => {
  const modalBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (blockPointer) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          modalBodyRef.current &&
          !modalBodyRef.current.contains(event.target as Node)
        )
          setIsOpen?.(false);
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, []);

  const modalBackgroundProps = {
    className: "modal-background",
    style: {
      backgroundColor: dimScreen ? "#00000045" : "transparent",
    },
  };

  const modalBodyProps = {
    className: "modal-body",
    ref: modalBodyRef,
    style: {
      backgroundColor: color ? color : "red",
      fontSize: fontSize ? fontSize : "inherit",
      top: center ? "50%" : "4rem",
      translate: center ? "50% -50%" : "50%",
    },
  };
  return (
    <>
      {blockPointer && <div {...modalBackgroundProps} />}
      <div {...modalBodyProps}>{modalText}</div>
    </>
  );
};

export default Modal;
