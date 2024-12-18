import { sluggify } from "../helpers.mjs";

/**
 * @typedef {import("../types.mjs").Constructor} Constructor
 */

/**
 * Augments an Application class by adding compatibility for modules that expect the ApplicationV1 header button API
 * @param {Constructor} BaseApplication 
 * @param {string} appName - Can be used to override the Class Name checked against by the `get${appName}HeaderButtons` hook
 * @returns 
 */
export function addAppV1HeaderButtonCompatability(BaseApplication, appName = BaseApplication.name) {
  class TemplateClass extends BaseApplication {
    /** @override */
    _getHeaderControls() {
      const controls = super._getHeaderControls();

      Hooks.callAll(`get${appName}HeaderButtons`, this, controls);

      for(const control of controls) {
        if('onclick' in control && !control.action) {
          const slug = sluggify(`${control.label} ${control.icon}`);
          if(controls.filter(c => c.action == slug).length > 0) {
            controls.splice(controls.indexOf(control), 1);
            continue;
          }
          this.options.actions[slug] = control.onclick;
          control.action = slug;
        }
      }

      return controls;
    }
  }

  return TemplateClass;
}