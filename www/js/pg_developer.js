//
// javascript page handler for about.html
//
(function(global) {
'use strict';
var developer = {
    randomData: [],

    pageLoaded: function(targetElem, html) {
        var self = this;
        var map = {
            loglevels:  "<option>DEBUG</option>"+
                        "<option>INFO</option>"+
                        "<option>NOTICE</option>"+
                        "<option>WARNING</option>"+
                        "<option>ERROR</option>",
        };
        targetElem.innerHTML = app.interpolate(html, map);

        // first initialize selectors from network tables.
        var html = "<table>";
        NetworkTables.getKeys().forEach(function(key)
        {
            if (key.startsWith("/SmartDashboard/Loggers/"))
            {
                var logger = key.replace("/SmartDashboard/Loggers/", "").replace(/</g, "&lt;");
                html = html + `<tr><td>${logger}:</td><td><select data-log="${logger}">${map.loglevels}</select></span></td></tr>`;
            }
        });
        html = html + "</table>";
        $(".logs").html(html);

        $("select[data-log]").each(function() {
            var select = $(this);
            var log = select.attr("data-log");
            var setting = NetworkTables.getValue("/SmartDashboard/Loggers/" + log);
            $(`option[data-text="${setting}"]`, select).attr("selected", true);

            // Function to run when a new <option> is picked
            select.change(function() {
                NetworkTables.putValue(`/SmartDashboard/Loggers/${log}`, $(this).find("option:selected").text());
            });
        });

        // build string.
        var val = NetworkTables.getValue("/SmartDashboard/Build", "n/a");
        $(".buildid").text("Robot sw build: " + val);

        // dabble wth flot
        var plot = $.plot("#randomPlot", [this.getRandomData()], {
                series: {
                    shadowSize: 0
                },
                yaxis: {
                    min: 0,
                    max: 100
                },
                xaxis: {
                    show: false
                }
        });
        function update() {
            plot.setData([self.getRandomData()]);
            plot.draw();
            setTimeout(update, 30);
        }
        update();

        // dabble with justgage...
        this.imuHeadingGage = new JustGage({
            id: "imuHeadingGage",
            value: 67,
            min: -180,
            max: 180,
            title: "IMU Heading",
            valueFontColor: "#888",
          });
        if(0) {
            var changeGage = function() {
                var val = Math.floor(Math.random() * 360 - 180);
                self.imuHeadingGage.refresh(val);
                window.setTimeout(changeGage, 2000);
            }
            changeGage();
        }
    },

    onNetTabChange: function(key, value, isNew) {
        if(key === "/SmartDashboard/Drivetrain_IMU_Heading")
        {
            this.imuHeadingGage.refresh(Number(value));
        }
    },

    getRandomData: function() {
        if(this.randomData.length > 0)
        {
            this.randomData = this.randomData.slice(1);
        }
        while(this.randomData.length < 300)
        {
            var prev = this.randomData.length > 0 ?
                        this.randomData[this.randomData.length-1] : 50;
            var y = prev + Math.random() * 10 - 5;
            if(y < 0)
            {
                y = 0;
            }
            else
            if(y > 100)
            {
                y = 100;
            }
            this.randomData.push(y);
        }
        // Zip the generated y values with the x values
        var res = [];
        for(var i=0; i<this.randomData.length; i++)
        {
            res.push([i, this.randomData[i]]);
        }
        return res;
    }
};
global.app.setPageHandler("developer", developer);
})(window);
