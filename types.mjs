/**
 * @typedef {object} DragDropConfiguration
 * @property {string} dragSelector     The CSS selector used to target draggable elements.
 * @property {string} dropSelector     The CSS selector used to target viable drop targets.
 * @property {Record<string, Function>} permissions    An object of permission test functions for each action
 * @property {Record<string, Function>} callbacks      An object of callback functions for each action
 */

/**
 * @typedef {object} Tab
 * @property {string} id                    The ID of the tab.
 * @property {string} group                 The ID of the group to which the tab belongs.
 * @property {string} icon                  CSS Classes for Font Awesome icon.
 * @property {string} label                 string or Localizable string for the Label of the Tab
 * @property {boolean | undefined} active   Whether this is the active tab or not
 * @property {string | undefined} cssClass  CSS Class applied by the framework for when the tab is active   
 */

/**
 * A class constructor.
 * Used for functions with generic class constructor parameters.
 * @typedef {new (...args: any[]) => any} Constructor
*/