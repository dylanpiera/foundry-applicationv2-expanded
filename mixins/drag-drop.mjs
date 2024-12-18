/**
 * @typedef {import("../types.mjs").Constructor} Constructor
 * @typedef {import("../types.mjs").DragDropConfiguration} DragDropConfiguration
 */

/**
 * Augments an Application class with drag-and-drop workflow handling
 * @param {Constructor} BaseApplication 
 * @returns 
 */
export function addDragDropHandling(BaseApplication) {
  class TemplateClass extends BaseApplication {
    /**
     * Include dragDrop options for the ApplicationV2Expanded class
     * @type {Object}
     * @property {DragDropConfiguration[]} dragDrop - An Array of dragDrop options
     * @static
     * @override
     */
    static DEFAULT_OPTIONS = {
      dragDrop: []
    }

    /**
     * @protected
     * @type {DragDrop[]}
     */
    _dragDropHandlers;

    constructor(options = {}) {
      super(options);

      this._dragDropHandlers = this._createDragDropHandlers();
    }

    /**
     * @protected
     * @returns {DragDrop[]}
     */
    _createDragDropHandlers() {
      return this.options.dragDrop.map((config) => {
        config.permissions = {
          dragstart: this._canDragStart.bind(this),
          drop: this._canDragDrop.bind(this),
        };
        config.callbacks = {
          dragstart: this._onDragStart.bind(this),
          dragover: this._onDragOver.bind(this),
          drop: this.#onDrop.bind(this),
        };
        return new DragDrop(config);
      });
    }

    /**
     * @override
     * @param {foundry.applications.api.ApplicationRenderContext} context 
     * @param {TRenderOptions} options 
     */
    _onRender(context, options) {
      super._onRender(context, options);

      // Attach drag-and-drop handlers
      this._dragDropHandlers.forEach((handler) => handler.bind(this.element));
    }

    /**
     * Define whether a user is able to begin a dragstart workflow for a given drag selector
     * @param {string} selector       The candidate HTML selector for dragging
     * @returns {boolean}             Can the current user drag this selector?
     * @protected
     */
    _canDragStart(selector) {
      return game.user.isGM;
    }

    /* -------------------------------------------- */

    /**
     * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
     * @param {string} selector       The candidate HTML selector for the drop target
     * @returns {boolean}             Can the current user drop on this selector?
     * @protected
     */
    _canDragDrop(selector) {
      return game.user.isGM;
    }

    /* -------------------------------------------- */

    /**
     * Callback actions which occur at the beginning of a drag start workflow.
     * @param {DragEvent} event       The originating DragEvent
     * @protected
     */
    _onDragStart(event) { }

    /* -------------------------------------------- */

    /**
     * Callback actions which occur when a dragged element is over a drop target.
     * @param {DragEvent} event       The originating DragEvent
     * @protected
     */
    _onDragOver(event) { }

    /* -------------------------------------------- */

    /**
     * Callback actions which occur when a dragged element is dropped on a target.
     * Since datatransfer can only be read once, the data is extracted and passed to the _handleDrop method
     * which developers should override to implement their own drop handling logic.
     * @param {DragEvent} event       The originating DragEvent
     * @protected
     */
    async #onDrop(event) { 
      const data = TextEditor.getDragEventData(event);
      return this._handleDrop(event, data);
    }

    /* -------------------------------------------- */

    /**
     * Callback actions which occur when a dragged element is dropped on a target.
     * @param {DragEvent} event       The originating DragEvent
     * @param {object} data           The extracted JSON data. The object will be empty if the DragEvent did not contain
     *                                JSON-parseable data.
     * @protected
     */
    async _handleDrop(event, data) {
      const allowed = Hooks.call(`drop${BaseApplication.name}Data`, this, data, this.document);
      if (allowed === false) return false;
    }
  }

  return TemplateClass;
}