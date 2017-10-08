// Friends List Service
var friendsListService = new sync.Service('friends')
    .setDataEmitter(function (service) {
        var friends = $('[data-friend-id]');
        var req     = {};
        for (var i = 0; i < friends.length; i++)
            req[friends.eq(i).text()] = parseInt(friends.eq(i).attr('data-friend-id'), 10);
        return req;
    }).setListeners(
        {
            start     : function (service, request) {
                log('#logs_friends', 'start', 'blue', tag('a', {'href': '#', 'data-json': encodeURIComponent(JSON.stringify(request, null, '\t'))}, 'View') + '  created data to request')
            },
            success   : function (data, service, textStatus, xmlHttpRequest) {
                for (var k in data) if (data.hasOwnProperty(k)) {
                    var state = data[k];
                    var u     = $('[data-friend-id="' + k + '"]');
                    if (u.hasClass('online') && state === false)
                        u.addClass('change-off');

                    if (!u.hasClass('online') && state === true)
                        u.addClass('change-on');

                    u.toggleClass('online', state);
                }

                //sort onlines first
                var friends = $('[data-friend-id]');
                /*friends.detach().sort(function (a, b) {
                 if ($(a).hasClass('online'))
                 return -1;
                 if ($(b).hasClass('online'))
                 return 1;
                 return 0;
                 });
                 $('#friendsList').append(friends);*/
                setTimeout(function () {
                    friends.removeClass('change-off change-on');
                }, 500);

                log('#logs_friends', 'success', 'green', tag('a', {'href': '#', 'data-json': encodeURIComponent(JSON.stringify(data, null, '\t'))}, 'View') + '  received data')
            },
            error     : function (service, xhr) {
                log('#logs_friends', 'error', 'orange', xhr.status + ': ' + xhr.responseText)
            },
            complete  : function (service, xmlHttpRequest) {
                log('#logs_friends', 'complete', (xmlHttpRequest.readyState !== 4 ? 'red' : undefined), xmlHttpRequest.statusText)
            },
            failedSync: function (service, xmlHttpRequest) {
                log('#logs_friends', 'failedSync', 'red', xmlHttpRequest.status + ': ' + xmlHttpRequest.statusText + '<br>' + xmlHttpRequest.responseText)
            }
        }
    ).register();


// Notifications Service
var notificationsService = new sync.Service('notifications')
    .setDataEmitter(function (service) {
        var commands      = [], cmd;
        var notifCommands = $('[data-notif]');
        for (var i = 0; i < notifCommands.length; i++)
            commands.push(notifCommands.eq(i).attr('data-name'));
        return commands;
    }).setListeners(
        {

            start     : function (service, request) {
                log('#logs_notifications', 'start', 'blue', tag('a', {'href': '#', 'data-json': encodeURIComponent(JSON.stringify(request, null, '\t'))}, 'View') + '  created data to request')
            },
            success   : function (data, service, textStatus, xmlHttpRequest) {
                for (var k in data) if (data.hasOwnProperty(k)) {
                    var notif      = data[k];
                    var elm        = $('[data-notif][data-name="' + k + '"]');
                    var lastNumber = elm.text();
                    if (notif !== 0) {
                        elm.text(notif).fadeIn();
                        if (notif != lastNumber) elm.addClass('changed');
                    }
                    else elm.fadeOut();
                }
                setTimeout(function () {
                    $('[data-notif]').removeClass('changed');
                }, 500);
                log('#logs_notifications', 'success', 'green', tag('a', {'href': '#', 'data-json': encodeURIComponent(JSON.stringify(data, null, '\t'))}, 'View') + '  received data')
            },
            error     : function (service, xhr) {
                log('#logs_notifications', 'error', 'orange', xhr.status + ': ' + xhr.responseText)
            },
            complete  : function (service, xmlHttpRequest) {
                log('#logs_notifications', 'complete', (xmlHttpRequest.readyState !== 4 ? 'red' : undefined), xmlHttpRequest.statusText)
            },
            failedSync: function (service, xmlHttpRequest) {
                log('#logs_notifications', 'failedSync', 'red', xmlHttpRequest.status + ': ' + xmlHttpRequest.statusText + '<br>' + xmlHttpRequest.responseText)
            }
        }
    ).setAlternative(2)
    .register();

// Statistics Service
var statisticsService = new sync.Service('statistics')
    .setListeners(
        {
            start     : function (service, request) {
                $('#syncst').text(sync._st);
                log('#logs_statistics', 'start', 'blue', tag('a', {'href': '#', 'data-json': encodeURIComponent(JSON.stringify(request, null, '\t'))}, 'View') + '  created data to request')
            },
            success   : function (data, service, textStatus, xmlHttpRequest) {
                $('#population').text(data['population']);
                // reset bar chart
                var barChartView = $('#barchart');
                if (barChartView.find('span').length > 0) barChartView.text(''); // remove "init..."
                var bars = data['chartBars'];

                var barsViews    = barChartView.find('i');
                var barsViewsLen = barsViews.length;

                var legendView     = $('#barchar-legend');
                var legendSpans    = legendView.find('span');
                var legendSpansLen = legendSpans.length;

                $(bars).each(function (idx, bar) {
                    var i, span;
                    //bars
                    var h = bar['percentage'] * 7 / 100;
                    if (barsViewsLen === 0) {
                        i = $(tag('i'));
                        barChartView.append(i);
                    } else i = barsViews.eq(idx);
                    i.css({'border-bottom-width': h + 'em', 'border-bottom-color': bar['color']});

                    //legends
                    if (legendSpansLen === 0) {
                        span = $(tag('span', null, tag('b')));
                        legendView.append(span);
                    } else span = legendSpans.eq(idx);
                    span.css({'color': bar['color']}).find('b').text(bar['name'] + ' - ' + bar['percentage'] + '%');
                });

                var polygon    = data['polygon'];
                var anchors    = polygon['anchors'];
                var canvasView = $('#polygon-canvas').get(0);
                var canvas     = canvasView.getContext('2d');
                canvas.clearRect(0, 0, 150, 150);
                var fc           = polygon['fillColor'];
                canvas.fillStyle = "rgba(" + fc.r + "," + fc.g + "," + fc.b + ",.5)";
                canvas.beginPath();
                for (var p = 0; p < anchors.length; p++) {
                    if (p === 0)
                        canvas.moveTo(anchors[p]['x'], anchors[p]['y']);
                    canvas.lineTo(anchors[p]['x'], anchors[p]['y']);
                }

                canvas.closePath();
                canvas.lineWidth   = .5;
                canvas.strokeStyle = "rgb(" + fc.r + "," + fc.g + "," + fc.b + ")";
                canvas.stroke();
                canvas.fill();
                log('#logs_statistics', 'success', 'green', tag('a', {'href': '#', 'data-json': encodeURIComponent(JSON.stringify(data, null, '\t'))}, 'View') + '  received data')
            },
            error     : function (service, xhr) {
                log('#logs_statistics', 'error', 'orange', xhr.status + ': ' + xhr.responseText)
            },
            complete  : function (service, xmlHttpRequest) {
                log('#logs_statistics', 'complete', (xmlHttpRequest.readyState !== 4 ? 'red' : undefined), xmlHttpRequest.statusText)
            },
            failedSync: function (service, xmlHttpRequest) {
                log('#logs_statistics', 'failedSync', 'red', xmlHttpRequest.status + ': ' + xmlHttpRequest.statusText + '<br>' + xmlHttpRequest.responseText)
            }
        }
    ).register();

$(document).ready(function () {
    // set commands
    //// clear logs
    $('[data-clearlog]').on('click', function () {
        var handler     = $(this);
        var logSelector = handler.attr('data-clearlog');
        $(logSelector).text('');
    });
    //// toggle services handlers
    $('[data-service-toggle]').on('click', function () {
        var handler = $(this);
        var s       = handler.attr('data-service-toggle');
        var service = undefined;
        switch (s) {
            case 'friends':
                service = friendsListService;
                break;
            case 'notifications':
                service = notificationsService;
                break;
            case 'statistics':
                service = statisticsService;
                break;
        }
        var enabled = service.getEnabled();
        handler.text(enabled ? 'Enable Service' : 'Disable Service');
        service.setEnabled(!enabled);
    });
    //// toggle sync
    $('[data-sync-toggle]').on('click', function () {
        var enabled = sync._enabled;
        $(this).text(enabled ? 'Enable Service' : 'Disable Service');
        sync.setEnabled(!enabled);

    });
    $(document).on('click', 'a[data-json]', function () {
        alert(decodeURIComponent($(this).attr('data-json')));
        return false;
    });
    $(document).on('click', '[data-friend-id]', function () {
        var t = $(this);
        alert(t.text() + ': ' + (t.hasClass('online') ? 'ONLINE' : 'OFFLINE'));
        return false;
    });
    $(window).on('focus blur', function (e) {
        window.focused = e.type === 'focus';
    });
    sync.init('sync_controller.php');

});

function log(selector, status, color, text) {
    if (!$('[data-toggle-logs="' + selector + '"]').is(':checked')) return;
    var logs = $(selector);
    var log  = tag('div', {'class': 'log' + (color ? ' ' + color : '')}, (
        (status ? tag('b', null, status) : '') +
        tag('span', null, text) +
        tag('i', null, new Date(Date.now()).toLocaleString())
    ));
    logs.append($(log));

    // limits
    var all   = logs.find('.log');
    var len   = all.length;
    var limit = 500;
    if (len > limit) for (var i = 0; i < len - limit; i++)
        all.eq(i).remove();

    if ($('[data-toggle-autoscroll="' + selector + '"]').is(':checked')) {
        logs.animate({scrollTop: logs[0].scrollHeight}, 500);
    }
}

function tag(name, attribs, content) {
    var attrs = '';
    if (attribs) for (var attr in attribs) {
        if (!attribs.hasOwnProperty(attr)) continue;
        attrs += attr + '="' + attribs[attr] + '" ';
    }
    attrs = attrs.slice(0, -1);
    return "<" + name + (attrs ? ' ' : '') + attrs + ">" + ( content || '') + "</" + name + ">";
}
