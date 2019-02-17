import React, {
  useRef,
  useEffect,
  forwardRef,
  Ref,
  useLayoutEffect
} from "react";
import { connect } from "react-redux";
import throttle from "lodash/throttle";

import { State, DrawingPoint, broadcastedDrawingPoints } from "./../store";

import Card from "react-bootstrap/Card";

import { canvasService } from "./../services/canvas";

interface BackCanvasProps {
  drawingPointsCache: DrawingPoint[][];
}

const BackCanvas = connect(
  ({ canvas }: State) => ({
    drawingPointsCache: canvas.drawingPointsCache
  }),
  null,
  null,
  { forwardRef: true }
)(
  forwardRef(
    ({ drawingPointsCache }: BackCanvasProps, ref: Ref<HTMLCanvasElement>) => {
      useLayoutEffect(() => {
        canvasService.redrawBack();
      }, [drawingPointsCache]);

      return (
        <canvas
          ref={ref}
          width={1280}
          height={720}
          style={{ border: "1px solid #999", width: "100%" }}
        />
      );
    }
  )
);

interface MainCanvasProps {
  isMouseDown: boolean;
  drawingPoints: DrawingPoint[][];
  broadcastedDrawingPoints: broadcastedDrawingPoints;
}

const MainCanvas = connect(
  ({ canvas }: State) => ({
    isMouseDown: canvas.isMouseDown,
    drawingPoints: canvas.drawingPoints,
    broadcastedDrawingPoints: canvas.broadcastedDrawingPoints
  }),
  null,
  null,
  { forwardRef: true }
)(
  forwardRef(
    (
      { isMouseDown, drawingPoints, broadcastedDrawingPoints }: MainCanvasProps,
      ref: Ref<HTMLCanvasElement>
    ) => {
      const { onMouseDown, onMouseMove, onMouseUp } = canvasService;

      useLayoutEffect(() => {
        canvasService.redraw();
      }, [drawingPoints, broadcastedDrawingPoints]);

      return (
        <canvas
          ref={ref}
          className="position-absolute"
          width={1280}
          height={720}
          style={{ border: "1px solid #999", width: "100%" }}
          onMouseDown={onMouseDown}
          onMouseMove={isMouseDown ? onMouseMove : undefined}
          onMouseUp={onMouseUp}
        />
      );
    }
  )
);

export const Canvas = () => {
  const boardRef = useRef(null);
  const backBoardRef = useRef(null);

  useEffect(() => {
    const onResize = throttle(() => canvasService.redrawBoth, 1000 / 60);

    canvasService.initializeBoard(boardRef.current, backBoardRef.current);

    document.addEventListener("mouseup", canvasService.onMouseUpOutsideBoard);
    window.addEventListener("resize", onResize);

    return () => {
      document.removeEventListener(
        "mouseup",
        canvasService.onMouseUpOutsideBoard
      );
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <Card className="mt-2">
      <Card.Header>Drawing Board</Card.Header>
      <Card.Body>
        <div className="position-relative">
          <MainCanvas ref={boardRef} />
          <BackCanvas ref={backBoardRef} />
        </div>
      </Card.Body>
    </Card>
  );
};
