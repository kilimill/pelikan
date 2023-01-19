export default function useDraggableCamera(dragElem) {
  const startDrag = (evt) => {
    evt.dataTransfer.dropEffect = "move";
    evt.dataTransfer.effectAllowed = "move";
  };

  const onDrop = (e) => {
    const dragElemWidth = dragElem.value.clientWidth;
    const dragElemHeight = dragElem.value.clientHeight;
    const pageX = e.pageX - dragElemWidth / 2;
    const pageY = e.pageY - dragElemHeight / 2;
    const innerHeight = window.innerHeight;
    const innerWidth = window.innerWidth;

    const calculateX = () => {
      if (pageX < 0) return 0;
      if (innerWidth - dragElemWidth - pageX <= 0)
        return innerWidth - dragElemWidth + "px";
      return pageX + "px";
    };
    const calculateY = () => {
      if (pageY < 0) return 0;
      if (innerHeight - dragElemHeight - pageY <= 0)
        return innerHeight - dragElemHeight + "px";
      return pageY + "px";
    };

    dragElem.value.style.left = calculateX();
    dragElem.value.style.top = calculateY();
  };

  return { startDrag, onDrop };
}
