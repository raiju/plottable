///<reference path="../reference.ts" />

module Plottable {
export module Dispatchers {
  export type MouseCallback = (p: Point, event: MouseEvent) => void;

  export class Mouse extends Dispatcher {
    private static _DISPATCHER_KEY = "__Plottable_Dispatcher_Mouse";
    private _translator: Utils.ClientToSVGTranslator;
    private _lastMousePosition: Point;

    private _moveCallbacks: Utils.CallbackSet<MouseCallback>;
    private _downCallbacks: Utils.CallbackSet<MouseCallback>;
    private _upCallbacks: Utils.CallbackSet<MouseCallback>;
    private _wheelCallbacks: Utils.CallbackSet<MouseCallback>;
    private _dblClickCallbacks: Utils.CallbackSet<MouseCallback>;

    /**
     * Get a Mouse Dispatcher for the <svg> containing elem.
     * If one already exists on that <svg>, it will be returned; otherwise, a new one will be created.
     *
     * @param {SVGElement} elem
     * @return {Dispatchers.Mouse}
     */
    public static getDispatcher(elem: SVGElement): Dispatchers.Mouse {
      var svg = Utils.DOM.getBoundingSVG(elem);

      var dispatcher: Mouse = (<any> svg)[Mouse._DISPATCHER_KEY];
      if (dispatcher == null) {
        dispatcher = new Mouse(svg);
        (<any> svg)[Mouse._DISPATCHER_KEY] = dispatcher;
      }
      return dispatcher;
    }

    /**
     * This constructor not be invoked directly.
     *
     * @constructor
     * @param {SVGElement} svg The root <svg> to attach to.
     */
    constructor(svg: SVGElement) {
      super();

      this._translator = Utils.ClientToSVGTranslator.getTranslator(svg);

      this._lastMousePosition = { x: -1, y: -1 };

      this._moveCallbacks = new Plottable.Utils.CallbackSet<MouseCallback>();
      this._downCallbacks = new Plottable.Utils.CallbackSet<MouseCallback>();
      this._upCallbacks = new Plottable.Utils.CallbackSet<MouseCallback>();
      this._wheelCallbacks = new Plottable.Utils.CallbackSet<MouseCallback>();
      this._dblClickCallbacks = new Plottable.Utils.CallbackSet<MouseCallback>();
      this._callbacks = [this._moveCallbacks, this._downCallbacks, this._upCallbacks, this._wheelCallbacks,
                         this._dblClickCallbacks];

      var processMoveCallback = (e: MouseEvent) => this._measureAndDispatch(e, this._moveCallbacks, "page");
      this._event2Callback["mouseover"] = processMoveCallback;
      this._event2Callback["mousemove"] = processMoveCallback;
      this._event2Callback["mouseout"] = processMoveCallback;
      this._event2Callback["mousedown"] = (e: MouseEvent) => this._measureAndDispatch(e, this._downCallbacks);
      this._event2Callback["mouseup"] = (e: MouseEvent) => this._measureAndDispatch(e, this._upCallbacks, "page");
      this._event2Callback["wheel"] = (e: WheelEvent) => this._measureAndDispatch(e, this._wheelCallbacks);
      this._event2Callback["dblclick"] = (e: MouseEvent) => this._measureAndDispatch(e, this._dblClickCallbacks);
    }

    /**
     * Registers a callback to be called when the mouse position changes.
     *
     * @param {MouseCallback} callback
     * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
     */
    public onMouseMove(callback: MouseCallback): Dispatchers.Mouse {
      this.setCallback(this._moveCallbacks, callback);
      return this;
    }

    /**
     * Removes a callback that would be called when the mouse position changes.
     *
     * @param {MouseCallback} callback
     * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
     */
    public offMouseMove(callback: MouseCallback): Dispatchers.Mouse {
      this.unsetCallback(this._moveCallbacks, callback);
      return this;
    }

    /**
     * Registers a callback to be called when a mousedown occurs.
     *
     * @param {MouseCallback} callback
     * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
     */
    public onMouseDown(callback: MouseCallback): Dispatchers.Mouse {
      this.setCallback(this._downCallbacks, callback);
      return this;
    }

    /**
     * Removes a callback that would be called when a mousedown occurs.
     *
     * @param {MouseCallback} callback
     * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
     */
    public offMouseDown(callback: MouseCallback): Dispatchers.Mouse {
      this.unsetCallback(this._downCallbacks, callback);
      return this;
    }

    /**
     * Registers a callback to be called when a mouseup occurs.
     *
     * @param {MouseCallback} callback
     * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
     */
    public onMouseUp(callback: MouseCallback): Dispatchers.Mouse {
      this.setCallback(this._upCallbacks, callback);
      return this;
    }

    /**
     * Removes a callback that would be called when a mouseup occurs.
     *
     * @param {MouseCallback} callback
     * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
     */
    public offMouseUp(callback: MouseCallback): Dispatchers.Mouse {
      this.unsetCallback(this._upCallbacks, callback);
      return this;
    }

    /**
     * Registers a callback to be called when a wheel event occurs.
     *
     * @param {MouseCallback} callback
     * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
     */
    public onWheel(callback: MouseCallback): Dispatchers.Mouse {
      this.setCallback(this._wheelCallbacks, callback);
      return this;
    }

    /**
     * Removes a callback that would be called when a wheel event occurs.
     *
     * @param {MouseCallback} callback
     * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
     */
    public offWheel(callback: MouseCallback): Dispatchers.Mouse {
      this.unsetCallback(this._wheelCallbacks, callback);
      return this;
    }

    /**
     * Registers a callback to be called when a dblClick occurs.
     *
     * @param {MouseCallback} callback
     * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
     */
    public onDblClick(callback: MouseCallback): Dispatchers.Mouse {
      this.setCallback(this._dblClickCallbacks, callback);
      return this;
    }

    /**
     * Removes a callback that would be called when a dblClick occurs.
     *
     * @param {MouseCallback} callback
     * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
     */
    public offDblClick(callback: MouseCallback): Dispatchers.Mouse {
      this.unsetCallback(this._dblClickCallbacks, callback);
      return this;
    }

    /**
     * Computes the mouse position from the given event, and if successful
     * calls all the callbacks in the provided callbackSet.
     */
    private _measureAndDispatch(event: MouseEvent, callbackSet: Utils.CallbackSet<MouseCallback>, scope: string = "element") {
      if (scope === "page" || this._translator.isWithinTarget(event)) {
        var newMousePosition = this._translator.computePosition(event.clientX, event.clientY);
        if (newMousePosition != null) {
          this._lastMousePosition = newMousePosition;
          callbackSet.callCallbacks(this.lastMousePosition(), event);
        }
      }
    }

    /**
     * Returns the last computed mouse position in <svg> coordinate space.
     *
     * @return {Point}
     */
    public lastMousePosition() {
      return this._lastMousePosition;
    }
  }
}
}
