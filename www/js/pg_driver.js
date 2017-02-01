//
// javascript page handler for driver.html
//
(function(global) {
'use strict';
var driver = {
    pageLoaded: function(targetElem, html) {
        targetElem.innerHTML = html;
        var dlink1 = {ip:"192.168.0.20", url: "/video.cgi"};
        var axis1 = {ip:"10.49.15.11", url: "/mjpg/video.mjpg"};
        var axis2 = {ip:"10.49.15.12", url: "/mjpg/video.mjpg"};

        var driverCam = dlink1;
        var sprocketCam = dlink1;

        $("#driverCam").html("<img width=\"400px\" src='http://" + driverCam.ip +
                                            driverCam.url + "''></img>");
        $("#sprocketCam").html("<img src='http://" + sprocketCam.ip +
                                            sprocketCam.url + "''></img>");

        // first initialize selectors from network tables.
        $(".selector").each(function() {
            var key = $(this).attr("id");
            var ntkey = "/SmartDashboard/" + key ;
            var val = NetworkTables.getValue(ntkey);
            $(this).val(val);
        });

        // now update network tables on changes
        $(".selector").change(function() {
            var value = $(this).val();
            var key = $(this).attr("id");
            var ntkey = "/SmartDashboard/" + key;
            NetworkTables.putValue(ntkey, value);
        });
    },
};

global.app.setPageHandler("driver", driver);
})(window);
