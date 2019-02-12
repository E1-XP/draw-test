import { Store, Dispatch } from "redux";

import * as actions from "./../actions";
import { store, State } from "./../store";

export const canvasService = new class CanvasService {
  private store: Store<State>;
  private dispatch: Dispatch;

  ctx: CanvasRenderingContext2D | null = null;
  backCtx: CanvasRenderingContext2D | null = null;

  constructor(store: Store<State>, dispatch: Dispatch) {
    this.store = store;
    this.dispatch = dispatch;
  }

  initializeBoard = (
    ref: HTMLCanvasElement | null,
    backRef: HTMLCanvasElement | null
  ) => {
    if (!ref || !backRef) throw new Error("Cannot find canvas refs.");

    this.ctx = ref.getContext("2d");
    this.backCtx = backRef.getContext("2d");
  };

  onMouseDown = (e: any) => {
    this.dispatch(actions.setIsMouseDown(true));
  };

  onMouseMove = (e: any) => {};

  onMouseUp = (e: any) => {
    const { groupCount } = this.store.getState().canvas;

    this.dispatch(actions.setIsMouseDown(false));
    this.dispatch(actions.setGroupCount(groupCount + 1));
  };
}(store, store.dispatch);
