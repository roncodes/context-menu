# context-menu

This fork of context-menu makes a small modification that removes the dependency of setting a selector, allowing the context menu to be called programatically on listen events.

A small (4.4kb / 1.7kb gzipped) JavaScript library for adding context menus to any HTML element.

```shell
npm install @mturco/context-menu
```

[See demo](https://mturco.github.io/context-menu/)

## API

### Constructor

```js
new ContextMenu(items[, options]);
```

* `items` (Array) - Array of menu items objects in the format of:
  * `name` (String) - Label displayed for menu item
  * `fn` (Function) - `onclick` event handler for menu item
  * *Note: to insert a divider, insert an empty object (`{}`) in the `items` array.*
* `options` (Object)
  * `className` (String, default: `''`) - CSS class to add to the context menu element
  * `minimalStyling` (Boolean, default: `false`) - If true, does not apply default theme CSS class to context menu element

### .on() / .off()

```js
ContextMenu.prototype.on(type, listener);
ContextMenu.prototype.off(type, listener);
```

* `type` (String) - Event type; one of: `created`, `shown`, `hidden`, `itemselected`
* `listener` (Function) - Callback for event listener

### .destroy()

Removes DOM elements and event listeners.

## Example

```js
import ContextMenu from 'context-menu';

const menu = new ContextMenu([
  { name: 'Add row', fn: () => { /* ... */ }},
  { name: 'Remove row', fn: () => { /* ... */ }},
]);

menu.on('itemselected', () => { /* ... */ });
```
