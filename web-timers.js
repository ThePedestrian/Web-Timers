/**
 *  
 * Web Timers is a Web Worker based utility to provide a
 *  more reliable/precise approach to the default timing
 *  utilities given by the browser.
 * 
 * 
 *  Copyright (c) 2017 Uffaz Nathaniel
 * 
 *   Released under the MIT License.
 *   See https://opensource.org/licenses/MIT for more information. 
 * 
 */
(function () {
    
    'use strict';
    
    // If the Worker's aren't available, fallback
    // to the default methods
    if (!window.Worker || !Blob) {
        window.wwSetTimout     = setTimeout;
        window.wwClearTimeout  = clearTimeout;
        window.wwSetInterval   = setInterval;
        window.wwClearInterval = clearInterval;
        return;
    }

    /**
     * A dictionary of all the spawned workers. A mapping
     * is kept to terminate the workers using the
     * `wsClearTimeout()` and `wsClearnInterval()` methods.
     */
    var spawnedWorkers = {};


    /**
     * Constructs a new random id
     * @returns {String} Id
     */
    var randomId = (function () {
        var i = 0;
        return function () {
            i += 1;
            return i + "_" + Date.now();
        };
    })();


    /**
     * Utility to Construct a new worker thread in which the contents
     * of `funcToExectue` will be turned into the contents of the
     * worker.
     * 
     * @param {Function} funcToExectue Code to exectue in which
     *           the interior of function will be turned into
     *           a string and used as a worker
     * @returns {Worker} Newly spawned worker
     */
    var BuildWorker = function (funcToExectue) {
        
        // Build a worker from an anonymous function body
        // Credits: http://stackoverflow.com/a/19201292
        var blob = new Blob([ '(', funcToExectue.toString(), ')()' ], { type: 'application/javascript' } );
        var blobURL = URL.createObjectURL(blob),
        worker = new Worker(blobURL);
        
        // clean up the URL
        try { URL.revokeObjectURL(blobURL); } catch (err) {}

        // Add to `spawnedWorkers` table
        var id = randomId();
        worker.id = id;
        spawnedWorkers[id] = worker;
        return worker;
    };


    /**
     * Terminate a worker by its given id
     * @param {String} id The id of the spawned worker
     */
    var terminateWorker = function (id) {
        var worker = spawnedWorkers[id];
        if (worker) {
            delete spawnedWorkers[id];
            worker.terminate();
        }
    };


    /**
     * Sets a timer which executes a function or specified
     * piece of code once after the timer expires.
     * @param {Function} callback Code to execute once the timer expires
     * @param {number} delay The time, in milliseconds the timer should
     *      wait before the specified function or code is executed.
     *      If this parameter is omitted, a value of 0 is used.
     * @returns {String} The returned timeoutID is a string value which
     *      identifies the timer created by the call to wwSetTimeout().
     *      This value can be passed to wsClearTimeout() to cancel the timeout
     */
    var wwSetTimeout = function (callback, delay) {

        // Worker thread that will signal back to the main
        // UI thread to execute the callback
        var worker = BuildWorker(function () {
            onmessage = function (e) {
                setTimeout(function () {
                    // Signal back to the UI thread that the
                    // timeout has occured. 
                    postMessage({});
                }, e.data.delay);
            };
        });

        // A message from the worker indicates the 
        // activity has ended
        worker.onmessage = function (e) {
            callback();
            terminateWorker(worker.id);
        };

        // Post to start the worker
        worker.postMessage({
            delay: delay
        });

        return worker.id;
    };


    /**
     * Sets a timer which repeatedly calls a function or executes a code snippet
     * with a fixed time delay between each call.
     * @param {Function} callback Code to execute once the timer expires
     * @param {number} delay The time, in milliseconds the timer should
     *      wait before the specified function or code is executed.
     *      If this parameter is omitted, a value of 0 is used.
     * @returns {String} The returned timeoutID is a string value which
     *      identifies the timer created by the call to wwSetInterval().
     *      This value can be passed to wsClearInterval() to cancel the timeout
     */
    var wwSetInterval = function (callback, delay) {
        // Worker thread that will signal back to the main
        // UI thread to execute the callback
        var worker = BuildWorker(function () {
            onmessage = function (e) {
                setInterval(function () {
                    // Signal back to the UI thread that the
                    // timeout has occured. 
                    postMessage({});
                }, e.data.delay);
            };
        });

        // A message from the worker indicates the 
        // activity has ended
        worker.onmessage = function (e) {
            callback();
        };

        // Post to start the worker
        worker.postMessage({
            delay: delay
        });

        return worker.id;
    };


    // Export out
    window.wwSetTimeout    = wwSetTimeout;
    window.wwSetInterval   = wwSetInterval;
    window.wwClearTimeout  = terminateWorker;
    window.wwClearInterval = terminateWorker;

})();
