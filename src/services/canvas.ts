import { Store, Dispatch } from "redux";

import * as actions from "./../actions";
import { store, State, DrawingPoint } from "./../store";

import { drawingService, DrawingService } from "./drawing";

export const canvasService = new class CanvasService {
  private drawingService: DrawingService;
  private store: Store<State>;
  private dispatch: Dispatch;

  ref: HTMLCanvasElement | null = null;
  backRef: HTMLCanvasElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;
  backCtx: CanvasRenderingContext2D | null = null;

  constructor(
    drawingService: DrawingService,
    store: Store<State>,
    dispatch: Dispatch
  ) {
    this.drawingService = drawingService;
    this.store = store;
    this.dispatch = dispatch;
  }

  initializeBoard = (
    ref: HTMLCanvasElement | null,
    backRef: HTMLCanvasElement | null
  ) => {
    if (!ref || !backRef) throw new Error("Cannot find canvas refs.");

    this.ref = ref;
    this.backRef = backRef;

    this.ctx = ref.getContext("2d");
    this.backCtx = backRef.getContext("2d");

    this.drawingService.initialize(ref, backRef, this.ctx!, this.backCtx!);

    setTimeout(this.redrawBoth, 500);
  };

  onMouseUpOutsideBoard = () => {
    const { isMouseDown, groupCount } = this.store.getState().canvas;

    if (isMouseDown) {
      this.dispatch(actions.setIsMouseDown(false));
      this.dispatch(actions.setGroupCount(groupCount + 1));
    }
  };

  onMouseDown = (e: any) => {
    this.dispatch(actions.setIsMouseDown(true));

    const points = <DrawingPoint[]>(
      this.drawingService.createInitialDrawingPoints(e)
    );
    points.forEach(p => this.dispatch(actions.setDrawingPoint(p)));

    this.redraw();
  };

  onMouseMove = (e: any) => {
    const point = <DrawingPoint>this.drawingService.createDrawingPoint(e);

    this.dispatch(actions.setDrawingPoint(point));
    this.redraw();
  };

  onMouseUp = (e: any) => {
    const { groupCount } = this.store.getState().canvas;

    this.dispatch(actions.setIsMouseDown(false));
    this.dispatch(actions.setGroupCount(groupCount + 1));

    this.redraw();
  };

  redraw = () => {
    this.drawingService.clearCanvas();
    this.drawingService.renderCanvas();
  };

  redrawBack = () => {
    this.drawingService.clearCanvas(this.backRef, this.backCtx);
    this.drawingService.renderCanvas(this.backCtx);
  };

  redrawBoth = () => {
    this.redraw();
    this.redrawBack();
  };
}(drawingService, store, store.dispatch);
