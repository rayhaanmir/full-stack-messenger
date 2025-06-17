import "./Modal.css";

interface ModalProps {
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  modalText: string;
  blockPointer?: boolean;
  color?: string;
  fontSize?: string;
}

const Modal = ({
  setIsOpen,
  modalText,
  blockPointer,
  color,
  fontSize,
}: ModalProps) => {
  return (
    <>
      {blockPointer && (
        <div className="modal-background" onClick={() => setIsOpen?.(false)} />
      )}
      <div
        className="modal-body"
        style={{
          backgroundColor: color ? color : "red",
          fontSize: fontSize ? fontSize : "inherit",
        }}
      >
        {modalText}
      </div>
    </>
  );
};

export default Modal;
