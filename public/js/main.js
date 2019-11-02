$(document).ready(function () {

   



    Storage.prototype.setObj = function(key, obj) {
        return this.setItem(key, JSON.stringify(obj))
    }
    Storage.prototype.getObj = function(key) {
        return JSON.parse(this.getItem(key))
    }




    if (typeof(localStorage.getObj("showAuthors"))=='undefined') {
        localStorage.setItem("showAuthors", true)
    };


    var showAuthors = localStorage.getObj("showAuthors");

    
    /////////////////////////////////////////////////////////////////////////////////////
    //                                                                                 //
    //                                   SLIDER                                        //
    /////////////////////////////////////////////////////////////////////////////////////
    $(function () {
        $("#wordSlider")
            .slider({
                change: (event, ui) => {
                    console.log(ui.value);
                    localStorage.setObj("numWords", ui.value);
                    createWordCloud()
                }
            });
    });


    $(function () {
        $("#authorSlider")
            .slider({
                change: (event, ui) => {
                    console.log(ui.value);
                    localStorage.setObj("numAuthors", ui.value);
                    createAuthorCloud()
                }
            });
    });

    $('#showAuthorItem').on('click', function(event) {
        showAuthors = ! showAuthors;
        if (!showAuthors) {
            $("#authorCloud").hide()
            $("#wordCloud").removeClass("col-lg-6").addClass("col-lg-10");
        } else {
            $("#authorCloud").show()
            $("#wordCloud").removeClass("col-lg-10").addClass("col-lg-6");
        }


        console.log("showAuthors "+showAuthors);
    });

    /////////////////////////////////////////////////////////////////////////////////////
    //                                                                                 //
    //                 EVENTS FOR QUERY_REMOVE BUTTONS                                 //
    /////////////////////////////////////////////////////////////////////////////////////

    $('#queryDiv').on('click', '.querybutton', function (event) {
        console.log("QUERYBUTTON CLICK: "+$(this).data('type')+" "+$(this).data('val')  )
        popSsArray($(this).data('type'),$(this).data('val'))
        $(this).remove();
        doQuery();
        queryArticles();
    })

    /////////////////////////////////////////////////////////////////////////////////////
    //                                                                                 //
    //                 EVENTS TO RESET QUERIES TO DEFAULTS
    /////////////////////////////////////////////////////////////////////////////////////

    $('.resetquery').on('click', function(e) {
        const type = $(this).data('type')
        console.log("RESET BUTTON FOR "+$(this).data('type'))
        localStorage.setObj(type, localStorage.getObj("default_"+type));
        queryArticles();
    })

    function pushSsArray(type, val) {
        curVal = localStorage.getObj(type)
        console.log("pushSsArray curVal: "+curVal+" val: "+val)
        if (curVal != null) {
            console.log("pushSsArray TYPE EXIST: "+type+" ARR: "+curVal+" "+localStorage.getObj(type))
            if (curVal == val) {
                return
            } else {
                try {
                    curVal.push(val)
                } catch (e) {
                    curVal = val;
                }
                localStorage.setObj(type, curVal)
            }
        } else {
            console.log("TYPE NEW : "+type+" ARR: "+curVal+" "+localStorage.getObj(type))
            localStorage.setObj(type, val)
        }
        renderQueryDiv(type)
    }
    function isJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
    function popSsArray(type, val) {
        curVal = isJson(localStorage.getObj(type))?JSON.parse(localStorage.getObj(type)):localStorage.getObj(type);
        if (curVal != null) {
            console.log("TYPE EXIST: "+type+" ARR: "+curVal+" "+localStorage.getObj(type))
            console.log("REMOVE INDEX: "+curVal.indexOf(val))
            curVal.splice(curVal.indexOf(val,1))
            localStorage.setObj(type, curVal)
            renderQueryDiv(type)
        } else {
            console.log("NO ARRAY TO POP: "+type+" ARR: "+curVal+" "+localStorage.getObj(type))

        }
    }
    /////////////////////////////////////////////////////////////////////////////////////
    //                                                                                 //
    //          LISTENERs FOR CLICKS ON SVG TEXT                                       //
    /////////////////////////////////////////////////////////////////////////////////////

    $(document).on("click", "text", function (e) {
        console.log("CLICKED: " + $(this).attr('class'))
        let divId = $(this).attr('class').replace("txt_")

        switch ($(this).attr('class')) {
            case 'txt_authorCloud':
                pushSsArray('authors', $(this).text())
                break;
            case 'txt_wordCloud':
                pushSsArray('words', $(this).text());
                break;

            default:
                break;
        }
        queryArticles();
    })
    
    function queryArticles() {
        $("#table-of-articles tr").remove();
        console.log("QUERY ARTICLES SOURCES: " + localStorage.getObj("sources"));
        console.log("QUERY ARTICLES WORDS: " + localStorage.getObj("words"));
        console.log("QUERY ARTICLES AUTHORS: " + localStorage.getObj("authors"));

        $.post("/api/articles/", {
            sources: localStorage.getObj("sources"),
            words: localStorage.getObj("words"),
            authors: localStorage.getObj("authors")
        })
            .done(data => {
                localStorage.setObj("data", data);
                localStorage.setObj("numWords", 100);
                localStorage.setObj("numAuthors", 100);
                doQuery();
            });
    }

    function renderArticles(first, last) {
        let data = localStorage.getObj("data");
        $('tbody').empty();
        data.articles.slice(first, last).forEach(article => {
            let tRow = $('<tr>').data('id', article.id);
            $(tRow).append($('<td>').text(article.author));
            $(tRow).append($('<td>').append($('<img>').attr('src', article.urlToImage).attr('width', 70)));
            $(tRow).append($('<td>').attr('href', '#').attr('onClick', 'window.open("' + article.url + '", "_blank")').text(article.title));
            $(tRow).append($('<td>').text(article.SourceId));
            $('tbody').append(tRow);
        });

    }

    function doQuery() {
        renderArticles(0, 49);
        createWordCloud();
        createAuthorCloud();
        renderQueryDiv('sources');
        renderQueryDiv('words');
        renderQueryDiv('authors');

        setSlider('#wordSlider', localStorage.getObj("data").wordcloud)
        setSlider('#authorSlider', localStorage.getObj("data").authorcloud)
    };

    function setSlider(id, arr) {
        let total = arr.length
        $(id).slider("option", {
            min: 0,
            max: total,
            value: total > 100 ? 100 : total / 2
        });

    }

    function initializePage() {
        if (localStorage.getObj('uid')) {
            $.get("/api/user/" + localStorage.getObj('uid'), function (userObj) {
                localStorage.setObj("sources", userObj.sources);
                localStorage.setObj("default_sources", userObj.sources);
                localStorage.setObj("authors", []);
                localStorage.setObj("default_authors", []);
                localStorage.setObj("words", []);
                localStorage.setObj("default_words", []);
            }).then(function () {
                queryArticles();
            });
        } else {
            window.location = './main.html';
        }
    }
    function renderQueryDiv(type) {
        let arr = localStorage.getObj(type);
        console.log("renderQueryDiv " + type + ": " + arr + " LENGTH: "+arr.length)
        $('#query'+type+'Row .querybutton').remove();
        if (arr) {
            let div = $('#query' + type + 'Row')
            arr.forEach(e => {
                if (e != "null") { div.append($('<button>').attr('class','querybutton').data('type',type).data('val',e).text(e))}
            });
        }
    }
    function createWordCloud() {
        createCloud(localStorage.getObj("data").wordcloud.slice(0, localStorage.getObj("numWords")), 'wordCloud');
    }

    function createAuthorCloud() {
        createCloud(localStorage.getObj("data").authorcloud.slice(0, localStorage.getObj("numAuthors")), 'authorCloud');
    }

    function createCloud(tags, divId) {
        var fill = d3.scale.category10();
        var w = $('#' + divId).width(),
            h = $('#' + divId).height();
        d3.select('#' + divId + ' svg ').remove();
        let div = document.getElementById(divId);
        let position = div.getBoundingClientRect();
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
            svg.attr("width", w).attr("height", h);

            scale = bounds ? Math.min(
                w / Math.abs(bounds[1].x - w / 2),
                w / Math.abs(bounds[0].x - w / 2),
                h / Math.abs(bounds[1].y - h / 2),
                h / Math.abs(bounds[0].y - h / 2)) / 2 : 1;

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
                .attr("class", "txt_" + divId)
        }

        function update() {
            layout.font('impact').rotate(function () { return ~~(Math.random() * 2) * 90; });
            fontSize = d3.scale['sqrt']().range([10, 100]);
            if (tags.length) {
                fontSize.domain([+tags[tags.length - 1].value || 1, +tags[0].value]);
            }
            layout.stop().words(tags).start();
        }

    }


    $("#word_filter").hide();
    

    // At the very start, pull down the user object for the logged in user and set the "default" query to be only their default sources.
    initializePage();

});
