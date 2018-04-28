import "jest-preset-angular";
import 'jest-zone-patch';

global["CSS"] = null;

Object.defineProperty(document.body.style, "transform", {
  value: () => {
    return {
      enumerable: true,
      configurable: true
    };
  }
});
