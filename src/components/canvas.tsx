import React, { useRef, useEffect } from "react";
import { connect } from "react-redux";

import { State, DrawingPoint, broadcastedDrawingPoints } from "./../store";

import Card from "react-bootstrap/Card";

import { canvasService } from "./../services/canvas";

interface Props {
  isMouseDown: boolean;
  drawingPoints: DrawingPoint[][];
  broadcastedDrawingPoints: broadcastedDrawingPoints;
  canvasService: typeof canvasService;
}

export const Canvas = connect(({ canvas }: State) => ({
  isMouseDown: canvas.isMouseDown,
  drawingPoints: canvas.drawingPoints,
  broadcastedDrawingPoints: canvas.broadcastedDrawingPoints,
  canvasService
}))(
  ({
    canvasService,
    isMouseDown,
    drawingPoints,
    broadcastedDrawingPoints
  }: Props) => {
    const { onMouseDown, onMouseMove, onMouseUp } = canvasService;

    const boardRef = useRef(null);
    const backBoardRef = useRef(null);

    useEffect(() => {
      canvasService.initializeBoard(boardRef.current, backBoardRef.current);
    }, []);

    return (
      <Card className="mt-2">
        <Card.Header>Drawing Board</Card.Header>
        <Card.Body>
          <div className="position-relative">
            <canvas
              ref={boardRef}
              className="position-absolute"
              width={1280}
              height={720}
              style={{ border: "1px solid #999", width: "100%" }}
              onMouseDown={onMouseDown}
              onMouseMove={isMouseDown ? onMouseMove : undefined}
              onMouseUp={onMouseUp}
            />
            <canvas
              ref={backBoardRef}
              width={1280}
              height={720}
              style={{ border: "1px solid #999", width: "100%" }}
            />
          </div>
        </Card.Body>
      </Card>
    );
  }
);
