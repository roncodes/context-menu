(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.ContextMenu = factory());
}(this, (function () { 'use strict';

function __$$styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css = ".ContextMenu{display:none;list-style:none;margin:0;max-width:250px;min-width:125px;padding:0;position:absolute;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.ContextMenu--theme-default{background-color:#fff;border:1px solid rgba(0,0,0,.2);-webkit-box-shadow:0 2px 5px rgba(0,0,0,.15);box-shadow:0 2px 5px rgba(0,0,0,.15);font-size:13px;outline:0;padding:2px 0}.ContextMenu--theme-default .ContextMenu-item{padding:6px 12px}.ContextMenu--theme-default .ContextMenu-item:focus,.ContextMenu--theme-default .ContextMenu-item:hover{background-color:rgba(0,0,0,.05)}.ContextMenu--theme-default .ContextMenu-item:focus{outline:0}.ContextMenu--theme-default .ContextMenu-divider{background-color:rgba(0,0,0,.15)}.ContextMenu.is-open{display:block}.ContextMenu-item{cursor:pointer;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ContextMenu-divider{height:1px;margin:4px 0}";
__$$styleInject(css);

var nextId = 0;

// Tiny polyfill for Element.matches() for IE
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector;
}

// Gets an element's next/previous sibling that matches the given selector
function getSibling(el, selector, direction) {
  if ( direction === void 0 ) direction = 1;

  var sibling = direction > 0 ? el.nextElementSibling : el.previousElementSibling;
  if (!sibling || sibling.matches(selector)) {
    return sibling;
  }
  return getSibling(sibling, selector, direction);
}

// Fires custom event on given element
function emit(el, type, data) {
  if ( data === void 0 ) data = {};

  var event = document.createEvent('Event');

  Object.keys(data).forEach(function (key) {
    event[key] = data[key];
  });

  event.initEvent(type, true, true);
  el.dispatchEvent(event);
}

var ContextMenu = function ContextMenu(items, options) {
  if ( options === void 0 ) options = {
  className: '',
  minimalStyling: false,
};

  this.items = items;
  this.options = options;
  this.id = nextId++;
  this.target = null;

  this.create();
};

// Creates DOM elements, sets up event listeners
ContextMenu.prototype.create = function create () {
    var this$1 = this;

  // Create root <ul>
  this.menu = document.createElement('ul');
  this.menu.className = 'ContextMenu';
  this.menu.setAttribute('data-contextmenu', this.id);
  this.menu.setAttribute('tabindex', -1);
  this.menu.addEventListener('keyup', function (e) {
    switch (e.which) {
      case 38:
        this$1.moveFocus(-1);
        break;
      case 40:
        this$1.moveFocus(1);
        break;
      case 27:
        this$1.hide();
        break;
      default:
        // do nothing
    }
  });

  if (!this.options.minimalStyling) {
    this.menu.classList.add('ContextMenu--theme-default');
  }
  if (this.options.className) {
    this.options.className.split(' ').forEach(function (cls) { return this$1.menu.classList.add(cls); });
  }

  // Create <li>'s for each menu item
  this.items.forEach(function (item, index) {
    var li = document.createElement('li');

    if (!('name' in item)) {
      // Insert a divider
      li.className = 'ContextMenu-divider';
    } else {
      li.className = 'ContextMenu-item';
      li.textContent = item.name;
      li.setAttribute('data-contextmenuitem', index);
      li.setAttribute('tabindex', 0);
      li.addEventListener('click', this$1.select.bind(this$1, li));
      li.addEventListener('keyup', function (e) {
        if (e.which === 13) {
          this$1.select(li);
        }
      });
    }

    this$1.menu.appendChild(li);
  });

  // Add root element to the <body>
  document.body.appendChild(this.menu);

  emit(this.menu, 'created');
};

// Shows context menu
ContextMenu.prototype.show = function show (e) {
  this.menu.style.left = (e.pageX) + "px";
  this.menu.style.top = (e.pageY) + "px";
  this.menu.classList.add('is-open');
  this.target = e.target;
  // Give context menu focus
  this.menu.focus();
  // Disable native context menu
  e.preventDefault();

  emit(this.menu, 'shown');
};

// Hides context menu
ContextMenu.prototype.hide = function hide () {
  this.menu.classList.remove('is-open');
  this.target = null;
  emit(this.menu, 'hidden');
};

// Selects the given item and calls its handler
ContextMenu.prototype.select = function select (item) {
  var itemId = item.getAttribute('data-contextmenuitem');
  if (this.items[itemId]) {
    // Call item handler with target element as parameter
    this.items[itemId].fn(this.target);
  }
  this.hide();
  emit(this.menu, 'itemselected');
};

// Moves focus to the next/previous menu item
ContextMenu.prototype.moveFocus = function moveFocus (direction) {
    if ( direction === void 0 ) direction = 1;

  var focused = this.menu.querySelector('[data-contextmenuitem]:focus');
  var next;

  if (focused) {
    next = getSibling(focused, '[data-contextmenuitem]', direction);
  }

  if (!next) {
    next = direction > 0
      ? this.menu.querySelector('[data-contextmenuitem]:first-child')
      : this.menu.querySelector('[data-contextmenuitem]:last-child');
  }

  if (next) { next.focus(); }
};

// Convenience method for adding an event listener
ContextMenu.prototype.on = function on (type, fn) {
  this.menu.addEventListener(type, fn);
};

// Convenience method for removing an event listener
ContextMenu.prototype.off = function off (type, fn) {
  this.menu.removeEventListener(type, fn);
};

// Removes DOM elements, stop listeners
ContextMenu.prototype.destroy = function destroy () {
  this.menu.parentElement.removeChild(this.menu);
  this.menu = null;
};

return ContextMenu;

})));
//# sourceMappingURL=context-menu.js.map
