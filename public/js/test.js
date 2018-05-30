$(document).ready(function () {
    var query = {
        sources: [],
        authors: null,
        words: []
    }

    function makeArrayFromEachElement_0(arr) {
        return arr.map(element => element[0])
    }

    function selectUpdate(id, arr) {
        let firstEl = $(id+" option:first-child");
        $(id).empty();
        $(id).append(firstEl);
        arr.forEach(element => {
            $(id).append($('<option>').text(element))
        });
    }

    function doPost() {
        $.post("/api/articles/", query)
            .done(data => {
                doQuery(data)
            });
    }

    function doQuery(data) {
        var articles = (data.articles).length;
        var words   = makeArrayFromEachElement_0(data.words);
        var sources = makeArrayFromEachElement_0(data.sources);
        var authors = makeArrayFromEachElement_0(data.authors);

        console.log("Articles: " + articles);
        console.log("Words: "    + JSON.stringify(words));
        console.log("Sources: " + JSON.stringify(sources));
        console.log("Authors: " + JSON.stringify(authors));

        // query.authors = authors;

        [
            ["#word_sel",   words],
            ["#author_sel", authors],
            ["#source_sel", sources]
        ].forEach(e => {
            selectUpdate(e[0], e[1])
        });

        $.post("/api/articles/", query);
    }

    $.get("/api/user/keith66fuller", function (userObj) {
        query.sources = JSON.parse(userObj.sources)
    })


    $('.goButton').on('click', function (event) {
        event.preventDefault();
        console.log("QUERY: " + JSON.stringify(query, null, 2));
        $.post("/api/articles/", query)
            .done(data => {
                doQuery(data)
            });
    });

    


    $('#source_sel').on('change', function (event) {
        query.sources = query.sources.slice(this.selectedIndex - 1, this.selectedIndex);
        doPost();
    })

    $('#author_sel').on('change', function (event) {
        console.log("index: "+this.selectedIndex)
        query.authors = query.authors.slice(this.selectedIndex - 1, this.selectedIndex);
        doPost();
    })

    $('#word_sel').on('change', function (event) {
        query.words = query.words.slice(this.selectedIndex - 1, this.selectedIndex);
        doPost();
    })


})