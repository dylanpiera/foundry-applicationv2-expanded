/**
 * @typedef {import("../types.mjs").Constructor} Constructor
 */

/**
 * Augments a DocumentSheetV2 class intended for use with Actors by adding specific handling for drag-and-drop workflows
 * This does not add the base drag-and-drop handling, only the specific handling for Actors
 * See {@link addDragDropHandling} for a more general implementation
 * @param {Constructor} BaseApplication 
 * @returns 
 */
export function addActorDragDropHandling(BaseApplication) {
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
        case "Item": return this._onDropItem(event, data);
        case "Actor": return this._onDropActor(event, data);
        case "Folder": return this._onDropFolder(event, data);
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

    /**
     * Handle dropping of an item reference or item data onto an Actor Sheet
     * @param {DragEvent} event            The concluding DragEvent which contains drop data
     * @param {object} data                The data transfer extracted from the event
     * @returns {Promise<Item[]|boolean>}  The created or updated Item instances, or false if the drop was not permitted.
     * @protected
     */
    async _onDropItem(event, data) {
      if ( !this.document.isOwner ) return false;
      const item = await Item.implementation.fromDropData(data);
      const itemData = item.toObject();

      // Handle item sorting within the same Actor
      if ( this.document.uuid === item.parent?.uuid ) return this._onSortItem(event, itemData);

      // Create the owned item
      return this._onDropItemCreate(itemData, event);
    }

    /**
     * Handle dropping of an Actor data onto another Actor sheet
     * @param {DragEvent} event            The concluding DragEvent which contains drop data
     * @param {object} data                The data transfer extracted from the event
     * @returns {Promise<object|boolean>}  A data object which describes the result of the drop, or false if the drop was
     *                                     not permitted.
     * @protected
     */
    async _onDropActor(event, data) {
      if ( !this.document.isOwner ) return false;
    }

    /**
     * Handle dropping of a Folder on an Actor Sheet.
     * The core sheet currently supports dropping a Folder of Items to create all items as owned items.
     * @param {DragEvent} event     The concluding DragEvent which contains drop data
     * @param {object} data         The data transfer extracted from the event
     * @returns {Promise<Item[]>}
     * @protected
     */
    async _onDropFolder(event, data) {
      if ( !this.document.isOwner ) return [];
      const folder = await Folder.implementation.fromDropData(data);
      if ( folder.type !== "Item" ) return [];
      const droppedItemData = await Promise.all(folder.contents.map(async item => {
        if ( !(document instanceof Item) ) item = await fromUuid(item.uuid);
        return item.toObject();
      }));
      return this._onDropItemCreate(droppedItemData, event);
    }

    /**
     * Handle the final creation of dropped Item data on the Actor.
     * This method is factored out to allow downstream classes the opportunity to override item creation behavior.
     * @param {object[]|object} itemData      The item data requested for creation
     * @param {DragEvent} event               The concluding DragEvent which provided the drop data
     * @returns {Promise<Item[]>}
     * @private
     */
    async _onDropItemCreate(itemData, event) {
      itemData = itemData instanceof Array ? itemData : [itemData];
      return this.document.createEmbeddedDocuments("Item", itemData);
    }

    /**
     * Handle a drop event for an existing embedded Item to sort that Item relative to its siblings
     * @param {Event} event
     * @param {Object} itemData
     * @private
     */
    _onSortItem(event, itemData) {
      // Get the drag source and drop target
      const items = this.document.items;
      const source = items.get(itemData._id);
      const dropTarget = event.target.closest("[data-item-id]");
      if ( !dropTarget ) return;
      const target = items.get(dropTarget.dataset.itemId);

      // Don't sort on yourself
      if ( source.id === target.id ) return;

      // Identify sibling items based on adjacent HTML elements
      const siblings = [];
      for ( let el of dropTarget.parentElement.children ) {
        const siblingId = el.dataset.itemId;
        if ( siblingId && (siblingId !== source.id) ) siblings.push(items.get(el.dataset.itemId));
      }

      // Perform the sort
      const sortUpdates = SortingHelpers.performIntegerSort(source, {target, siblings});
      const updateData = sortUpdates.map(u => {
        const update = u.update;
        update._id = u.target._id;
        return update;
      });

      // Perform the update
      return this.document.updateEmbeddedDocuments("Item", updateData);
    }
  }

  return TemplateClass;
}