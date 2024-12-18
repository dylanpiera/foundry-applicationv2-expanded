/**
 * @typedef {import("../types.mjs").Constructor} Constructor
 * @typedef {import("../types.mjs").Tab} Tab
 */

/**
 * Augments an Application class by adding an expanded tabs API
 * See README.md for more detailed usage information & examples
 * @param {Constructor} BaseApplication 
 * @returns 
 */
export function addTabsHandling(BaseApplication) {
  class TemplateClass extends BaseApplication {

    /**
     * The tabGroups object keeps track of which tab is currently being viewed
     * The keys are the Tab Group IDs, while the values are the ID of the active tab 
     * 
     * @type {Record<string, string>}
     */
    tabGroups = {}

    /**
     * The tabs themselves 
     * @see {@link Tab}
     * @type {Record<string, Tab>}
     */
    tabs = {}

    /**
     * Prepares the tabs data for rendering
     * @returns {Tab[]}
     */
    _getTabs() {
      for(const tab of Object.values(this.tabs)) {
        tab.active = this.tabGroups[tab.group] === tab.id;
        tab.cssClass = tab.active ? "active" : "";
      }
      return this.tabs;
    }

    /** @override */
    async _prepareContext(options) {
      return {
        ...(await super._prepareContext(options)),
        tabs: this._getTabs(),
      }
    }
  }

  return TemplateClass;
}