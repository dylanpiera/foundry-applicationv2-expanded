import { addDragDropHandling } from "../mixins/index.mjs";

/**
 * @typedef {Object} ApplicationConfigurationExpanded
 */

/**
 * The ApplicationV2Expanded class is an extension of the ApplicationV2 class
 * @template {ApplicationRenderOptions} TRenderOptions
 * @extends {ApplicationV2<ApplicationConfigurationExpanded, TRenderOptions>}
 */
export default class ApplicationV2Expanded extends addDragDropHandling(foundry.applications.api.ApplicationV2) {
  
  
}