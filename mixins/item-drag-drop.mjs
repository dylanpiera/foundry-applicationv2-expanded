/**
 * @typedef {import("../types.mjs").Constructor} Constructor
 */

/**
 * Augments a DocumentSheetV2 class intended for use with Items by adding specific handling for drag-and-drop workflows
 * This does not add the base drag-and-drop handling, only the specific handling for Items
 * See {@link addDragDropHandling} for a more general implementation
 * @param {Constructor} BaseApplication 
 * @returns 
 */
export function addItemDragDropHandling(BaseApplication) {
  class TemplateClass extends BaseApplication {

    /**
     * Adds default handling for drag-and-drop events meant for Actors
     * Heavily inspired by the default implementation in the core FoundryVTT code AppV1 ActorSheet.
     * @override 
     * */
    async _handleDrop(event, data) {
      if (!this.document || !data?.type) return false;

      const allowed = super._handleDrop(event, data);
      if (!allowed) return false;

      switch (data.type) {
        case "ActiveEffect": return this._onDropActiveEffect(event, data);
      }
    }

    /**
     * Handle the dropping of ActiveEffect data onto an Actor Sheet
     * @param {DragEvent} event                  The concluding DragEvent which contains drop data
     * @param {object} data                      The data transfer extracted from the event
     * @returns {Promise<ActiveEffect|boolean>}  The created ActiveEffect object or false if it couldn't be created.
     * @protected
     */
    async _onDropActiveEffect(event, data) {
      if(!this.document.isOwner) return false;
      const effect = await ActiveEffect.implementation.fromDropData(data);
      if (!effect) return false;
      if (effect.target === this.document) return false;
      return ActiveEffect.create(effect.toObject(), { parent: this.document });
    }
  }

  return TemplateClass;
}