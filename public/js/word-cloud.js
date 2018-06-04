$(document).ready(function () {

    $.post("/api/articles/", { wclimit: 100 })
        .done(data => {
            // var weight = 40;
            var tags = data.wordcloud;
            
            console.log(tags.length)
            for (i = 0; i < tags.length; i++) {
                tags[i].value = Math.log2(tags[i].value)*2;
                // weight-=2;
                // console.log(tags[i].value)
            }
            
            console.log(tags);
            createWordCloud(tags);
        });
    

    function createWordCloud(t) {

        var tags = t;
        var fill = d3.scale.category10();

        // var w = window.innerWidth,
        //     h = window.innerHeight;

        // var w = 100,
        //     h = 100;
        var w = 2000,
            h = 700;

        var max,
            fontSize;

        var layout = d3.layout.cloud()
            .timeInterval(Infinity)
            .size([w, h])
            .fontSize(function (d) {
                return fontSize(+d.value);
            })
            .text(function (d) {
                return d.key;
            })
            .on("end", draw);

        var svg = d3.select("#vis").append("svg")
            .attr("width",w)
            .attr("height",h);

        var vis = svg.append("g").attr("transform", "translate(" + [w >> 1, h >> 1] + ")");

        update();

        if (window.attachEvent) {
            window.attachEvent('onresize', update);
        }
        else if (window.addEventListener) {
            window.addEventListener('resize', update);
        }

        function draw(data, bounds) {
            // var w = window.innerWidth,
            //     h = window.innerHeight;
            var w = 1500,
                h = 1000;
            //    var w = (".word-cloud").innerWidth,
            //     h = (".word-cloud").innerHeight;

            svg.attr("width", w).attr("height", h);

            scale = bounds ? Math.min(
                w / Math.abs(bounds[1].x - w / 2),
                w / Math.abs(bounds[0].x - w / 2),
                h / Math.abs(bounds[1].y - h / 2),
                h / Math.abs(bounds[0].y - h / 2)) / 2 : 1;

            var text = vis.selectAll("text")
                .data(data, function (d) {
                    return d.text.toLowerCase();
                });
            text.transition()
                .duration(1000)
                .attr("transform", function (d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .style("font-size", function (d) {
                    return d.size + "px";
                });
            text.enter().append("text")
                .attr("text-anchor", "middle")
                .attr("transform", function (d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .style("font-size", function (d) {
                    return d.size + "px";
                })
                .style("opacity", 1e-6)
                .transition()
                .duration(1000)
                .style("opacity", 1);
            text.style("font-family", function (d) {
                return d.font;
            })
                .style("fill", function (d) {
                    return fill(d.text.toLowerCase());
                })
                .text(function (d) {
                    return d.text;
                })
                .style("cursor", "pointer")
                .on("click", function (d, i) {
                    window.open(d.url, "_blank");
                    console.log(d.text.toLowerCase());
                });

            vis.transition().attr("transform", "translate(" + [750,210] + ")scale(" + scale + ")");
        }

        function update() {
            // layout.font('impact').spiral('rectangular');
            layout.font('impact').rotate(function() { return ~~(Math.random() * 2) * 90; });
            fontSize = d3.scale['sqrt']().range([10, 100]);
            if (tags.length) {
                fontSize.domain([+tags[tags.length - 1].value || 1, +tags[0].value]);
            }
            layout.stop().words(tags).start();
        }

    }

});