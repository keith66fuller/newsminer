$(document).ready(function () {
    Storage.prototype.setObj = function(key, obj) {
        return this.setItem(key, JSON.stringify(obj))
    }
    Storage.prototype.getObj = function(key) {
        return JSON.parse(this.getItem(key))
    }

    /////////////////////////////////////////////////////////////////////////////////////
    //                                                                                 //
    //                                   SLIDER                                        //
    /////////////////////////////////////////////////////////////////////////////////////
    $(function () {
        $("#wordSlider")
            .slider({
                change:  (event, ui) => {
                    console.log(ui.value);
                    localStorage.setObj("numWords", ui.value);
                    createWordCloud()
                }
            });
    });

    $(function () {
        $("#authorSlider")
        .slider({
            change:  (event, ui) => {
                console.log(ui.value);
                localStorage.setObj("numAuthors", ui.value);
                createAuthorCloud()
            }
        });
    });

    var query = {
        sources: [],
        authors: null,
        words: []
    };

    var result = query;

    var defaultQuery = query;

    function makeArrayFromEachElement_0(arr) {
        return arr.map(element => element[0]);
    }

    function selectUpdate(id, arr) {
        let firstEl = $(id + " option:first-child");
        $(id).empty().append(firstEl);
        arr.forEach(element => {
            $(id).append($('<option>').text(element));
        });
    }

    function queryArticles() {
        $.post("/api/articles/", query)
            .done(data => {
                localStorage.setObj("data", data);
                localStorage.setObj("numWords", 100);
                localStorage.setObj("numAuthors", 100);
                doQuery();
            });
    }

    function renderwords() {
        let data = JSON.parse(localStorage.getObj("data"));
        let words = makeArrayFromEachElement_0(data.words);
    }

    function renderArticles(first, last) {
        let data = JSON.parse(localStorage.getObj("data"));
        $('tbody').empty();
        data.articles.slice(first, last).forEach(article => {
            let tRow = $('<tr>').data('id', article.id);
            $(tRow).append($('<td>').text(article.author));
            $(tRow).append($('<td>').append($('<img>').attr('src', article.urlToImage).attr('width', 100)));
            $(tRow).append($('<td>').attr('href', '#').attr('onClick', 'window.open("' + article.url + '", "_blank")').text(article.title));
            $(tRow).append($('<td>').text(article.SourceId));

            // <td><img src="{{this.urlToImage}}" alt=""  width="70"></td>
            // <td><a href="#" onClick="window.open('{{this.url}}', '_blank')">{{this.title}}</a></td>

            // $(tRow).append($('<td>').text(article.newest));
            $('tbody').append(tRow);
        });
    }

    function doQuery() {
        renderArticles(0, 49);
        createWordCloud();
        createAuthorCloud();
        renderQueryDiv();

        setSlider('#wordSlider',JSON.parse(localStorage.getObj("data")).wordcloud)
        setSlider('#authorSlider',JSON.parse(localStorage.getObj("data")).authorcloud)
    };

    function setSlider(id, arr) {
        let total = arr.length
        $(id).slider("option", {
            min: 0,
            max: total,
            value: total>100?100:total/2
        });
    }

    function initializePage() {
        $.get("/api/user/keith66fuller", function (userObj) {
            query = {
                sources: JSON.parse(userObj.sources),
                authors: null,
                words: []
            };

        }).then(function () {
            queryArticles();
        });
    }

    function renderQueryDiv() {
        $('.querydiv-row').empty()
        query.sources.forEach(source => {
            $('#querySources').append($('<button>').text(element))
        });
    }

    function createWordCloud() {
        createCloud(JSON.parse(localStorage.getObj("data")).wordcloud.slice(0, JSON.parse(localStorage.getObj("numWords"))), 'wordCloud');
    }

    function createAuthorCloud() {
        createCloud(JSON.parse(localStorage.getObj("data")).authorcloud.slice(0, JSON.parse(localStorage.getObj("numAuthors"))), 'authorCloud');
    }

    function createCloud(tags, divId) {
        var fill = d3.scale.category10();
        var w = $('#' + divId).width(),
            h = $('#' + divId).height();
        // w=1500
        // h=700

        // This empties the entire div
        // $('#'+divId).empty();

        // This removes the SVG
        d3.select('#' + divId + ' svg ').remove();

        // $('svg').remove();

        let div = document.getElementById(divId);

        let position = div.getBoundingClientRect();
        // console.log('POSITION for '+divId+" --> "+JSON.stringify(position,null,2))

        let bounds = [
            {
                x: position.x,
                y: position.y
            },
            {
                x: position.right,
                y: position.bottom,
            }
        ];

        // console.log('BOUNDS for '+divId+" --> "+JSON.stringify(bounds,null,2))

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

        // This is what places the SVG on the page before the slider element.
        var svg = d3.select('#' + divId).insert("svg", ".slider")
            .attr("width", w)
            .attr("height", h);

        var vis = svg.append("g").attr("transform", "translate(" + [w >> 1, h >> 1] + ")");

        update();

        if (window.attachEvent) {
            window.attachEvent('onresize', update);
        }
        else if (window.addEventListener) {
            window.addEventListener('resize', update);
        }

        function draw(data, bounds) {
            // console.log('BOUNDS in draw() --> '+JSON.stringify(bounds,null,2))

            svg.attr("width", w).attr("height", h);

            scale = bounds ? Math.min(
                w / Math.abs(bounds[1].x - w / 2),
                w / Math.abs(bounds[0].x - w / 2),
                h / Math.abs(bounds[1].y - h / 2),
                h / Math.abs(bounds[0].y - h / 2)) / 2 : 1;

            // console.log('SCALE in draw() --> '+JSON.stringify(scale,null,2))

            scale = 1.4;

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
                    // console.log(d.text.toLowerCase());
                    query.words = d.text;
                    // console.log(JSON.stringify(query, null, 2))

                    queryArticles();
                });

            // vis.transition().attr("transform", "translate(" + [850, 400] + ")");
            // vis.transition().attr("transform", "translate(" + [750, 210] + ")scale(" + scale + ")");
        }

        function update() {
            // console.log("UPDATE THIS: "+this)
            // layout.font('impact').spiral('rectangular');
            layout.font('impact').rotate(function () { return ~~(Math.random() * 2) * 90; });
            fontSize = d3.scale['sqrt']().range([10, 100]);
            // console.log("UPDATE TAGS : "+JSON.stringify(tags))
            if (tags.length) {
                fontSize.domain([+tags[tags.length - 1].value || 1, +tags[0].value]);
            }
            layout.stop().words(tags).start();
        }

    }
    // At the very start, pull down the user object for the logged in user and set the "default" query to be only their default sources.
    initializePage();

    $('#source_sel').on('change', function (event) {
        query.sources = result.sources[this.selectedIndex - 1];
        queryArticles();
    });

    $('#author_sel').on('change', function (event) {
        console.log("index: " + (this.selectedIndex - 1));
        query.authors = result.authors[this.selectedIndex - 1];
        queryArticles();
    });

    $('#word_sel').on('change', function (event) {
        query.words = result.words[this.selectedIndex - 1];
        queryArticles();
    });
});
