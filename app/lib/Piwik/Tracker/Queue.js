/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/** @private */
var Piwik  = require('library/Piwik');
/** @private */
var config = require('config');

/**
 * @class    Piwik Tracking Queue. It orders/processes the tracking requests in a FIFO manner. 
 *           The queue makes sure there will be a pause of 2 seconds between two Piwik tracking API requests. 
 *           Otherwise we possibly get faulty statistics. Makes also sure there will be only a limited number
 *           of API requests on each day. For example max 200 tracking requests per day.
 *           Once the whole queue is processed it'll stop processing the queue and start the queue as soon as a new 
 *           element is offered automatically.
 *           It'll also stop the queue if the user has no internet connection. Once the internet connection is back the
 *           queue processes automatically. But it won't store tracking requests beyond application sessions.
 * 
 * @example
 * var queue = require('Queue');
 * queue.offer({id:5});      // Offer an element. If queue is not already running, it'll start it automatically.
 *
 * @exports  TrackerQueue as Piwik.Tracker.Queue
 * @static
 * 
 * @todo     stop proccessing tracking requests when app goes in background? On iOS this happens "automatically"
 */
function TrackerQueue () {
    
    /**
     * This is the actual queue holding all offered tracking requests/paramters that have not been sent yet.
     * 
     * @type  Array
     * 
     * @private
     */
    var queue          = [];
    
    /**
     * Stores whether the queue is currently running or not. If the queue is already running we should make sure no 
     * other timeout will be registered.
     * 
     * @defaults  false
     *
     * @type      boolean
     * 
     * @private
     */
    var isQueueRunning = false;

    /**
     * How many trackings have been sent today. We reset this as soon as a new day starts. 
     *
     * @defaults  0
     *
     * @type      number
     * 
     * @private
     */
    var numTracksToday  = 0;

    /**
     * Holds the date string in the format "Sun Jul 17 2011". This allows us to detect whether a new day has started
     * by comparing this value with the current date string.
     *
     * @see       Piwik.Tracker.Queue#isNewDay
     *
     * @defaults  ""
     *
     * @type      string
     * 
     * @private
     */
    var dateStringToday = '';
    
    /**
     * The delay in ms between two tracking requests.
     * 
     * @defaults  2000
     * 
     * @type      number
     * 
     * @private
     */
    var delayInMs = 2000;

    /**
     * Detects whether a new day has started or not.
     *
     * @returns  {boolean}  true if it is a new day, false otherwise.
     */
    this.isNewDay = function () {
        var now     = new Date();
        var dateNow = now.toDateString();
        // dateNow is like 'Sun Jul 17 2011'

        if (!dateStringToday) {
            // initialize dateStringToday
            dateStringToday = dateNow;
        }

        if (dateNow != dateStringToday) {
            // it is a new day
            dateStringToday = dateNow;
            
            return true;
        }

        return false;
    };
    
    /**
     * Inserts the specified parameter/element into this queue, if possible. It fails to insert the parameter
     * if maxTracksPerDay is achieved. It automatically starts the queue if the queue is not already running.
     * You do not have to call {@link Piwik.Tracker.Queue#start}.
     */
    this.offer = function (parameter) {

        if (!parameter) {
            
            return;
        }

        if (this.isNewDay()) {
            // reset num tracks today and allow again maxTracksPerDay
            numTracksToday = 0;
        }

        if (config.tracking.maxTracksPerDay && config.tracking.maxTracksPerDay <= numTracksToday) {
            // set maxTracksPerDay to 0 for unlimited tracks per day. Do not dispatch more than configured

            return;
        }

        numTracksToday++;
        
        // add parameter to the actual queue.
        queue.push(parameter);
        
        parameter = null;
        
        if (!this.isRunning()) {
            // never start the queue if already running. 
            this.start();
        }
    };
    
    /**
     * Verifies whether the queue is empty or whether there are still elements within the queue.
     * 
     * @returns  {boolean}  true if the queue is empty, false otherwise.
     */
    this.isEmpty = function () {
        return (!queue || !queue.length);
    };
    
    /**
     * Retrieves and removes the head of this queue.
     * 
     * @returns  {null|Object}  null if queue is empty, the next parameter otherwise.
     */
    this.poll = function () {
        if (this.isEmpty()) {

            return;
        }
        
        return queue.shift();
    };
    
    /**
     * Clears/resets the queue. Removes all offered parameters. The queue will be empty afterwards.
     */
    this.clear = function () {
        
        if (!this.isEmpty()) {
            queue = [];
        }
    };
    
    /**
     * Starts proccessing the queue. You have to make sure to start the queue only if the queue is not already running.
     * Otherwise you start the queue twice or even more often. 
     */
    this.start = function () {
        isQueueRunning = true;
        
        this.dispatch();
    };
    
    /**
     * Stops processing the queue immediately. It'll not clear/reset the queue.
     */
    this.stop = function () {
        isQueueRunning = false;
    };
    
    /**
     * Verifies whether the queue is currently running or not.
     * 
     * @returns  {boolean}  true if the queue is running, false otherwise.
     */
    this.isRunning = function () {
        return isQueueRunning;
    };
    
    /**
     * Delays the next dispatch. It'll delay the next dispatch only if queue is running and if queue is not empty.
     * If queue is empty, it'll make a pause.
     */
    this.delayNextDispatch = function () {
                
        if (!this.isRunning()) {
            // do not delay the next dispatch process if queue is stopped.
            
            return;
        }
        
        if (this.isEmpty()) {
            this.pause();
            
            return;
        }

        setTimeout((function (that) {
            
            return function () {
                that.dispatch();
                that = null;
            }

        })(this), delayInMs);
    };

    /**
     * Pauses the queue. It's similar to stop but it does not stop the queue immediately. It'll only stop the queue
     * if there are no new offers within the configured timeout. If there are no new offers within the timeout, it'll
     * stop the queue. Otherwise it'll continue to process the queue. Thereby we have the advantage that we have not to
     * wait the configured 2 seconds when starting the queue. 
     * 
     * Imagine we send the last tracking request of the queue and the queue stops immediately afterwards. Now, for 
     * example 0.9 seconds later, there is a new offer. Cause the queue is stopped we have to start the queue 
     * again and we would have to make sure there's still a 2 second pause between the last send and the new offered
     * reqeuest. That means we either always have to wait 2 seconds when starting the queue (in this case this
     * results in a pause of 2.9 seconds which is not optimal) or we have to store the exact time of the last 
     * tracking request and calculate the difference (making a pause of 1.1 seconds when starting the queue. This
     * is more complex than just making a pause). 
     * 
     * Cause we just pause the queue for a short time before we stop the queue we have the chance to look whether there
     * was a new offer within the last 2 seconds. Then decide whether we stop the queue or whether we dispatch the
     * new offer. 
     */
    this.pause = function () {
        
        if (!this.isRunning()) {
            
            return;
        }
        
        setTimeout((function (that) {
            
            return function () {
                if (that.isEmpty()) {
                    // queue is still empty, stop queue now.
                    that.stop();
                } else {
                    // there was a new offer within the last 2 seconds, dispatch it now
                    that.dispatch();
                }
                
                that = null;
            }
            
        })(this), delayInMs);
    };

    /**
     * Dispatches/sends a tracking request. It'll only do this if network is available and if there are still 
     * elements within the queue. It'll automatically delay the next dispatch if there are still elements within the 
     * queue once the request (head of the queue) is triggered. If the network is not available it'll automatically 
     * processes the request later once the internet connection is back.
     */
    this.dispatch = function () {
        
        if (!this.isRunning()) {
            // queue is not running.
            
            return;
        }
        
        if (!Ti.Network || !Ti.Network.online) {
            this.stop();
            
            return;
        };
        
        if (this.isEmpty()) {
            // This should just happen if one clear's the queue. If the queue is empty it'll never delay the
            // dispatch process. 
            this.pause();
            
            return;
        }
        
        var parameter = this.poll();
        var tracker   = Piwik.require('Network/TrackerRequest');
        
        tracker.setParameter(parameter);
        tracker.send();

        tracker   = null;
        parameter = null;
        
        this.delayNextDispatch();
    };
}

module.exports = new TrackerQueue();