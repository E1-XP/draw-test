import { Store, Dispatch } from "redux";

import { store, State, DrawingPoint } from "./../store";
import * as actions from "./../actions";

export type DrawingService = typeof drawingService;

export const drawingService = new class DrawingService {
  ref: HTMLCanvasElement | null = null;
  backRef: HTMLCanvasElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;
  backCtx: CanvasRenderingContext2D | null = null;

  constructor(private store: Store<State>, private dispatch: Dispatch) {}

  initialize = (
    ref: HTMLCanvasElement,
    backRef: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    backCtx: CanvasRenderingContext2D
  ) => {
    this.setRefs(ref, backRef);
    this.setContext(ctx, backCtx);
  };

  setRefs = (ref: HTMLCanvasElement, backRef: HTMLCanvasElement) => {
    this.ref = ref;
    this.backRef = backRef;
  };

  setContext = (
    ctx: CanvasRenderingContext2D,
    backCtx: CanvasRenderingContext2D
  ) => {
    this.ctx = ctx;
    this.backCtx = backCtx;
  };

  createDrawingPoint = (e: any, onMouseDownMode = false) => {
    const state = this.store.getState();
    const { username } = state.user;
    const { groupCount } = state.canvas;

    const { pageX, pageY } = e;
    const { scrollX, scrollY } = window;

    const { top, left, width, height } = this.ref!.getBoundingClientRect();

    const xPos = ((pageX - left - scrollX) / width) * this.ref!.width;
    const yPos = ((pageY - top - scrollY) / height) * this.ref!.height;

    const pointFactory = (opts: Partial<DrawingPoint> = {}) => ({
      x: opts.x || xPos,
      y: opts.y || yPos,
      date: opts.date || Date.now(),
      group: opts.group !== undefined || groupCount,
      user: opts.user || username
    });

    if (onMouseDownMode) {
      return [pointFactory(), pointFactory({ x: xPos + 3, y: yPos + 3 })];
    }

    return pointFactory();
  };

  createInitialDrawingPoints = (e: any) => {
    return this.createDrawingPoint(e, true);
  };

  private setCacheAndGetCombinedDrawingPoints = () => {
    const { drawingPointsCache } = this.store.getState().canvas;
    const cacheLen = drawingPointsCache.length;
    const combined = this.getCombinedDrawingPoints();

    //set cache and return points over cache length
    const divisor = 10;
    const isNewCacheLengthDifferent =
      Math.floor(cacheLen / divisor) !== Math.floor(combined.length / divisor);

    if (isNewCacheLengthDifferent) {
      const newCacheLen = combined.length - (combined.length % divisor);
      const newCache = combined.slice(0, newCacheLen);

      this.dispatch(actions.setPointsCache(newCache));

      return combined.slice(newCacheLen);
    }

    return cacheLen ? combined.slice(cacheLen - 1) : combined;
  };

  private getCombinedDrawingPoints = () => {
    const {
      drawingPoints,
      broadcastedDrawingPoints,
      drawingPointsCache
    } = this.store.getState().canvas;

    const cacheLen = drawingPointsCache.length;

    const combineIfNoCache = () =>
      Object.values(broadcastedDrawingPoints)
        .reduce((acc, itm) => acc.concat(itm.filter(itm => !!itm)), [])
        .concat(drawingPoints.filter(itm => !!itm))
        .sort((a, b) => a[0].date - b[0].date);

    const combineWithCache = () => {
      const existAndNotCached = (itm: DrawingPoint[]) =>
        !!itm && itm[0].date > drawingPointsCache[cacheLen - 1][0].date;

      const newValues = Object.values(broadcastedDrawingPoints)
        .reduce((acc, itm) => acc.concat(itm.filter(existAndNotCached)), [])
        .concat(drawingPoints.filter(existAndNotCached))
        .sort((a, b) => a[0].date - b[0].date);

      return drawingPointsCache.concat(newValues);
    };

    return cacheLen ? combineWithCache() : combineIfNoCache();
  };

  clearCanvas = (ref = this.ref, ctx = this.ctx) => {
    if (!ref || !ctx) return;

    const { width, height } = ref;

    ctx.fillStyle = "#ffffff";
    ctx.clearRect(0, 0, width, height);
  };

  renderCanvas = (ctx = this.ctx) => {
    if (!ctx) return;

    ctx.fillStyle = "#000";
    ctx.lineJoin = "round";

    const toDraw =
      ctx === this.ctx
        ? this.setCacheAndGetCombinedDrawingPoints()
        : this.store.getState().canvas.drawingPointsCache;

    const draw = this.drawWithCtx(ctx);

    toDraw.forEach(arr => arr.forEach(draw));
  };

  private drawWithCtx = (ctx = this.ctx) => (
    point: DrawingPoint,
    i: number,
    arr: DrawingPoint[]
  ) => {
    const { x, y } = point;

    i &&
      requestAnimationFrame(() => {
        if (!ctx) throw new Error("Context not found.");

        ctx.beginPath();
        ctx.lineTo(arr[i - 1].x, arr[i - 1].y);
        ctx.lineTo(x, y);
        ctx.stroke();
      });
  };
}(store, store.dispatch);
