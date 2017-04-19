# Web Timers

### Overview

Web Timers is a Web Worker based utility to provide a more reliable/precise approach to the default timing utilities given by the browser. These include: `setTimeout()`, `setInterval()`, `clearTimeout()`, and `clearInterval()` methods.

[Complications further arise](http://stackoverflow.com/a/16033979) when the tab is inactive, however, you still want some functionality to execute reliably at some interval in the background.

Web Timers addresses this by using HTML5's [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) to spawn new workers that manage the time more accurately including when the tab is inactive.

---

### Methods

Web Timers exposes the following methods:

 - **`wwSetTimout(callback, delay)`** -- Sets a timer which executes a function or specified piece of code once after the timer expires. This method returns a timeoutId which may be passed to `wwClearTimeout()`
 - **`wwSetInterval(callback, delay)`** -- Sets a timer which repeatedly calls a function or executes a code snippet with a fixed time delay between each call
 - **`wwClearTimeout(id)`**  -- Cancels a timeout previously established by calling `wwSetTimeout()`
 - **`wwClearInterval(id)`**  -- Cancels an interval previously established by calling `wwSetInterval()`


---

### License

The MIT License (MIT)

