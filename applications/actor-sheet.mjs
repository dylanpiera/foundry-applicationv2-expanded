import { addActorDragDropHandling } from "../mixins/actor-drag-drop.mjs";
import { addDragDropHandling } from "../mixins/index.mjs";

export default class ActorSheetV2Expanded extends addActorDragDropHandling(addDragDropHandling(foundry.applications.sheets.ActorSheetV2)) {

  static DEFAULT_OPTIONS = {
    form: {
      submitOnChange: true
    },
    window: {
      resizable: true
    }
  }

  /** @override */
  async _prepareContext(options) {
    return {
      ...(await super._prepareContext(options)),
      editable: this.isEditable,
      document: this.document,
      actor: this.actor,
      item: this.item,
      data: this.document.toObject(false),
      owner: this.document.isOwner,
      title: this.title,
      options: this.options
    }
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);

    if(this.isEditable) {
      this.element.find("img[data-edit]").on("click", this._onEditImage.bind(this));
    }
  }

  /**
   * Handle changing a Document's image.
   * @param {MouseEvent} event  The click event.
   * @returns {Promise}
   * @protected
   */
  _onEditImage(event) {
    const attr = event.currentTarget.dataset.edit;
    const current = foundry.utils.getProperty(this.document, attr);
    const { img } = this.document.constructor.getDefaultArtwork?.(this.document.toObject()) ?? {};
    const fp = new FilePicker({
      current,
      type: "image",
      redirectToRoot: img ? [img] : [],
      callback: path => {
        event.currentTarget.src = path;
        if ( this.options.form.submitOnChange ) return this.submit();
      },
      top: this.position.top + 40,
      left: this.position.left + 10
    });
    return fp.browse();
  }

  /** @override */
  async _processSubmitData(event, form, submitData) {
    if(!this.document.id) return this.document.updateSource(submitData);
    return super._processSubmitData(event, form, submitData);
  }

  /** @override */
  _canDragStart(selector) {
    return this.isEditable;
  }

  /** @override */
  _canDragDrop(selector) {
    return this.isEditable;
  }

  /** @override */
  _onDragStart(event) {
    const li = event.currentTarget;
    if ("link" in event.target.dataset) return;

    // Create drag data
    let dragData;

    // Owned Items
    if (li.dataset.itemId) {
      const item = this.document.items?.get(li.dataset.itemId);
      dragData = item?.toDragData();
    }

    // Active Effect
    if (li.dataset.effectId) {
      const effect = this.document.effects.get(li.dataset.effectId);
      dragData = effect?.toDragData();
    }

    if (!dragData) return;

    // Set data transfer
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }
}