/*!
 *  Copyright 2017 Pejman Chatrrooz
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 *
 * @type {{Service:Window.sync.Service ,XHR:{responseText:string,status:int},getService: sync.getService,url: string,requestMethod:string, interval: number, registerService: Window.sync.registerService, unregisterService: Window.sync.unregisterService, setEnabled: Window.sync.setEnabled, init: Window.sync.init}}
 */
window.sync = {
    url          : undefined,
    interval     : 3,//seconds
    requestMethod: 'POST',

    _working         : false,
    _timer           : undefined,
    _services        : [],
    _enabled         : false,
    _st              : 0,
    /**
     *
     * @param {string} url
     * @param {int} [interval=3]
     * @param {'POST'|'post'|'get'|'GET'} [requestMethod="POST"] <p>only <b>"POST"</b> and <b>"GET"</b> are valid</p>
     * @param {boolean} [enabled=true]
     *
     * @return {boolean}
     */
    init             : function (url, interval, requestMethod, enabled) {
        if (interval === undefined) interval = 3;
        if (enabled === undefined) enabled = true;
        if (requestMethod === undefined) requestMethod = 'POST';
        sync.url           = url;
        sync.interval      = interval;
        sync.requestMethod = requestMethod;
        if (enabled !== true && enabled !== false) return sync._enabled;
        sync.setEnabled(enabled);
        return sync._enabled;
    },
    /**
     *
     * @param {sync.Service} service
     * @return {boolean}
     */
    registerService  : function (service) {
        if (sync._getServicePos(service._dataKey) !== -1)
            return false;
        sync._services.push(service);
        return true;
    },
    /**
     *
     * @param {string} dataKey
     * @return {boolean}
     */
    unregisterService: function (dataKey) {
        var pos = sync._getServicePos(dataKey);
        if (pos === -1)
            return false;
        sync._services.splice(pos, 1);
        return true;
    },
    /**
     *
     * @param {string} dataKey
     * @return {number}
     */
    _getServicePos   : function (dataKey) {
        var sLen = sync._services.length, i;
        for (i = 0; i < sLen; i++)
            if (sync._services[i]._dataKey === dataKey)
                return i;
        return -1;
    },
    /**
     *
     * @param {string} dataKey
     * @return sync.Service|undefined
     */
    getService       : function (dataKey) {
        var pos = sync._getServicePos(dataKey);
        if (pos === -1)
            return undefined;
        return sync._services[pos];
    },
    setEnabled       : function (state) {
        if (sync._enabled === state) return; // skip duplicate request on _enabled change
        if (!state && sync._timer > 0) {
            if (sync._ajx) sync._ajx.abort();
            clearTimeout(sync._timer);
        }
        if (state && !sync._working)
            sync._sync();
    },
    _sync            : function () {
        if (!sync._enabled || sync._working) return;
        sync._working = true;
        var sLen      = sync._services.length, i, srv, gd;
        var data      = {};
        // set data
        for (i = 0; i < sLen; i++) {
            srv = sync._services[i];
            if (srv && srv.getEnabled() && srv._checkforalt()) {
                data[srv._dataKey] = null;
                if ((gd = srv._getData())) data[srv._dataKey] = gd;
            }
        }
        var ajxParams = {
            type      : this.requestMethod,
            data      : data,
            url       : this.url,
            beforeSend: function () {
                // performing starts
                sLen = sync._services.length;
                for (var i = 0; i < sLen; i++) {
                    var srv = sync._services[i];
                    if (srv.getEnabled() && srv._checkforalt() && srv.listeners.start)
                        srv.listeners.start(srv, data[srv._dataKey]);
                }
            },
            error     : function (xhr) {
                sLen = sync._services.length;
                for (var i = 0; i < sLen; i++) {
                    var srv = sync._services[i];
                    if (srv && srv.getEnabled() && srv._checkforalt() && srv.listeners.failedSync)
                        srv.listeners.failedSync(srv, xhr);
                }
            },
            success   : function (data, textStatus, xhr) {
                var i, srv;
                sLen = sync._services.length;
                if (data.hasOwnProperty('_ok')) {
                    var ok = data['_ok'];
                    for (i = 0; i < sLen; i++) {
                        srv = sync._services[i];
                        if (srv && ok.hasOwnProperty(srv._dataKey) && srv.getEnabled() && srv._checkforalt() && srv.listeners.hasOwnProperty('success'))
                            srv.listeners.success(ok[srv._dataKey], srv, textStatus, xhr);
                    }
                }
                if (data.hasOwnProperty('_er')) {
                    var rt = 'responseText', st = 'status';
                    var er = data['_er'];
                    for (i = 0; i < sLen; i++) {
                        srv = sync._services[i];
                        if (srv && er.hasOwnProperty(srv._dataKey) && srv.getEnabled() && srv._checkforalt() && srv.listeners.hasOwnProperty('error'))
                            srv.listeners.error(srv, {responseText: (er[srv._dataKey].hasOwnProperty(rt) ? er[srv._dataKey][rt] : undefined), status: (er[srv._dataKey].hasOwnProperty(st) ? er[srv._dataKey][st] : undefined)});
                    }
                }
            },
            complete  : function (xhr) {
                sync._working = false;
                sLen          = sync._services.length;
                for (var i = 0; i < sLen; i++) {
                    var srv = sync._services[i];
                    if (srv && srv.getEnabled() && srv._checkforalt() && srv.listeners.complete)
                        srv.listeners.complete(srv, xhr);
                }
                if (sync._timer) clearTimeout(sync._timer);
                sync._timer = setTimeout(function () {
                    sync._sync();
                }, sync.interval * 1000);
                sync._st++;
            }
        };
        try {
            if (Object.keys(data).length === 0)
                ajxParams.complete(null);
            else
                sync._ajx = $.ajax(ajxParams);
        } catch (er) {
            sync._ajx = $.ajax(ajxParams);
        }

    },
    /**
     *
     * @param {string} dataKey
     * @param {boolean} [enabled=true]
     * @constructor
     */
    Service          : function (dataKey, enabled) {
        this._dataKey  = dataKey;
        this._alt      = 0;
        this.listeners = {};
        this._enabled  = enabled !== false;
    }
};
/**
 *
 * @type {{getDataKey: sync.Service.getDataKey, setEnabled: sync.Service.setEnabled, getEnabled: sync.Service.getEnabled, setDataEmitter: sync.Service.setDataEmitter, setListeners: sync.Service.setListeners, _getData: sync.Service._getData, register: sync.Service.register, unRegister: sync.Service.unRegister}}
 */
sync.Service.prototype = {
    _dataKey      : undefined,
    /**
     *@return string
     */
    getDataKey    : function () {
        return this._dataKey;
    },
    /**
     *
     * @param {boolean} state
     * @return {sync.Service}
     */
    setEnabled    : function (state) {
        this._enabled = state;
        return this;
    },
    /** @return {boolean} */
    getEnabled    : function () { return this._enabled; },
    /** @param {function(service:sync.Service)} dataEmitter
     * @return {sync.Service} */
    setDataEmitter: function (dataEmitter) {
        this._dataEmitter = dataEmitter;
        return this;
    },
    /**
     *
     * @param {{
     * start:function(service:sync.Service,request)|undefined,
     * success:function(data,service:sync.Service,textStatus,xhr:XMLHttpRequest)|undefined,
     * error:function(service:sync.Service,xhr:Window.sync.XHR)|undefined,
     * failedSync:function(service:sync.Service,xhr:XMLHttpRequest)|undefined,
     * complete:function(service:sync.Service,xhr:XMLHttpRequest)|undefined
     * }} listeners
     * @return {sync.Service}
     */
    setListeners  : function (listeners) {
        this.listeners = listeners;
        return this;
    },
    _getData      : function () {
        if (!this._dataEmitter) return null;
        return this._dataEmitter();
    },
    register      : function () {
        sync.registerService(this);
        return this;
    },
    unRegister    : function () {
        sync.unregisterService(this._dataKey);
        return this;
    },
    setAlternative: function (every) {
        this._alt = every;
        return this;
    },
    _checkforalt  : function () {
        return this._alt === 0 || sync._st % this._alt === 0;
    }

};
