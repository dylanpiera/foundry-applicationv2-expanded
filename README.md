# Foundry AppV2 Expanded
This is an opinionated expansion of the ApplicationV2 framework introduced in FoundryV12 and comes with four classes; `ApplicationV2Expanded`, `DocumentSheetV2Expanded`, `ActorSheetV2Expanded` and `ItemSheetV2Expanded` as well as a handful of helpful Mixins.

## How to use
You can use these files in a couple of ways:
1. You could install the mod completely and use every part it has to offer
2. You could copy individual files into your project and only use those
3. You could use it as inspiration to upgrade your own (base) classes & mixins

## AppV2 Tips
Besides this, you can find useful tips on how to use or convert your old Foundry Systems / Modules AppV1 applications to AppV2 on the [Community Foundry Wiki](https://foundryvtt.wiki/).
- [ApplicationV2](https://foundryvtt.wiki/en/development/api/applicationv2)
- [Conversion Guide](https://foundryvtt.wiki/en/development/guides/converting-to-appv2)

## What is added?
### Applications
#### [ApplicationV2Expanded](/applications/application.mjs)
`appv2expanded.applications.ApplicationV2Expanded`
- Adds the basic Drag & Drop Mixin

#### [DocumentSheetV2Expanded](/applications/document-sheet.mjs)
`appv2expanded.applications.DocumentSheetV2Expanded`
- [Adds the basic Drag & Drop Mixin](#drag--drop)
- Defaults 'form.submitOnChange' and 'window.resizable' options to true
- Adds the "[token]" prefix to the title of Token Actor Sheets
- Adds default values found in AppV1 `DocumentSheet#getData` to `_prepareContext`
- Adds AppV1s Image Editing logic (e.g. click an `<img data-edit>` to open a file browser to select the Document's image)
- Adds a check for temporary documents, so that they do not throw an error on submission of the Sheet, similar to AppV1s implementation, and instead calls updateSource on them with form submision data.
- Adds default values for `_canDragStart` and `_canDragDrop` from the basic Drag & Drop Mixin
- Adds default handling for `_onDragStart` from the basic Drag & Drop Mixin, supporting automatic detection of HTMLElements, items by `data-item-id` and effects by `data-effect-id`.

The following features from AppV1 DocumentSheet are not (yet) implemented:
- Secrets
- Editor handling (as this is integrated with the new editor)

#### [ActorSheetV2Expanded](/applications/actor-sheet.mjs)
`appv2expanded.applications.ActorSheetV2Expanded`
- All of DocumentSheetV2Expanded plus...
- Adds Actor specific Drag & Drop handling from the [Actor Drag & Drop Mixin](#actor-drag--drop)
- Adds `actor` and `token` properties to `_prepareContext`

#### [ItemSheetV2Expanded](/applications/item-sheet.mjs)
`appv2expanded.applications.ItemSheetV2Expanded`
- All of DocumentSheetV2Expanded plus...
- Adds Item specific Drag & Drop handling from the [Item Drag & Drop Mixin](#item-drag--drop)
- Adds `actor` and `item` properties to `_prepareContext`

### Mixins
#### [Drag & Drop](/mixins/drag-drop.mjs)
`appv2expanded.mixins.addDragDropHandling`
- Adds `dragDrop` parameter to `DEFAULT_OPTIONS` based on AppV1 `DragDropConfiguration`.
- Initializes `DragDrop` handlers similar to AppV1's implementation
- Adds `_canDragStart`, `_canDragDrop`, `_onDragStart`, `_onDragOver`, `#onDrop`, `_handleDrop` functions to assist with the Drag & Drop workflow, similar to AppV1's implementation
  - **Breaking change for AppV1 Migrations**: `_onDrop` has been made private, instead you should use `_handleDrop`. This is so there is no conflict in receiving the event's datatransfer, as it may only be read once. You can check the source for more details.

#### [Actor Drag & Drop](/mixins/actor-drag-drop.mjs)
`appv2expanded.mixins.addActorDragDropHandling`
> **Note**: Assumes that the Application also makes use of the above [Drag & Drop Mixin](#drag--drop).

- Adds default `_handleDrop` handling like AppV1's implementation
  - ActiveEffects not currently owned by the Actor get added to the Actor
  - Items not currently owned by the Actor get added to the Actor, if they are already owned, sorting workflow is triggered
  - A Folder of items dropped on the Actor will create all items within it on the Actor
- Adds `_onSortItem` handling like AppV1's implementation

#### [Item Drag & Drop](/mixins/item-drag-drop.mjs)
`appv2expanded.mixins.addItemDragDropHandling`
> **Note**: Assumes that the Application also makes use of the above [Drag & Drop Mixin](#drag--drop).

- Adds default `_handleDrop` handling like AppV1's implementation
  - ActiveEffects not currently owned by the Item get added to the Item

#### [Tab Handling](/mixins/tabs.mjs)
`appv2expanded.mixins.addTabsHandling`

The tab handling is done through a combination of some additional properties & method extensions, as well as some handlebars templating.
The following examples will use the ApplicationV1 `ActiveEffectConfig` tab information as a basis.

First, you will need to define your tabs by overriding the `tabs` property.
```js
/** @override */
tabs = {
  details: {
    id: "details",
    group: "main",
    icon: "fas fa-book",
    label: "EFFECT.TabDetails"
  },
  duration: {
    id: "duration",
    group: "main",
    icon: "fas fa-clock",
    label: "EFFECT.TabDuration"
  },
  effects: {
    id: "effects",
    group: "main",
    icon: "fas fa-cogs",
    label: "EFFECT.TabEffects"
  }
}
```

You will also need to make sure to define your tab groups, for this example we only have one primary group called `main`.
The key property is the id of the group, while the value is the default opened tab, in our case 'details'.
```js
/** @override */
tabGroups = {
  main: "details"
}
```

To render the tabs, we recommend adding a tabs template and adding it to your parts, for example:
```js
/** @override */
static PARTS = {
  tabs: {
    id: "tabs",
    template: "path/to/tabs.hbs"
  },
  /** Other parts of your application */
}
```
An example of `tabs.hbs`
```hbs
<nav class="sheet-tabs tabs">
  {{#each tabs as |tab|}}
    <a class="{{tab.cssClass}}" data-action="tab" data-group="{{tab.group}}" data-tab="{{tab.id}}">
      <i class="{{tab.icon}}"></i> 
      <label>{{localize tab.label}}</label>
    </a>
  {{/each}}
</nav>
```

After this there's only one final step left, which is adding the correct tab's cssClass to the corresponding template, for example:
```hbs
<section class="tab {{tabs.details.cssClass}}" data-tab="{{tabs.details.id}}" data-group="{{tabs.details.group}}">
  <!-- The remainder of your template -->
</section>
```
> Make sure to update the `.details.` to the correct tab that this section represents!

Following this pattern, you can make each tab its own part of the application, allowing you to put each tab in a different hbs file and allowing individual rerenders of those parts.

#### [AppV1 Header Button Compatability](/mixins/appv1-header-button.mjs)
`appv2expanded.mixins.addAppV1HeaderButtonCompatability`

Many modules currently do not support ApplicationV2, and as such if you move your Actor/Item sheets over to AppV2, and your users are using any module that adds header buttons to AppV1 sheets, those modules will break as they won't know how to add their header buttons.
This mixin calls the old AppV1 `get{ApplicationClass.name}HeaderButtons` to attempt to locate any buttons, and converts them to AppV2 based handlers.

You can use the second parameter `appName` to define a custom name, for example, you could use `ActorSheet` for Actor based AppV2 applications, as even when using ActorSheetV2, the name of the hook would be `getActorSheetV2HeaderButtons` instead of `getActorSheetHeaderButtons`.
