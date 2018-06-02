$(document).ready(function () {
    var query = {
        sources: [],
        authors: null,
        words: []
    }

    var result = query;

    var defaultQuery = query;

    function makeArrayFromEachElement_0(arr) {
        return arr.map(element => element[0])
    }

    function selectUpdate(id, arr) {
        console.log("ARRAY IS " + arr);
        let firstEl = $(id + " option:first-child");
        $(id).empty().append(firstEl);
        arr.forEach(element => {
            $(id).append($('<option>').text(element))
        });
    }

    function queryArticles() {
        console.log("QUERY ARTICLES: \n" + JSON.stringify(query, null, 2));
        $.post("/api/articles/", query)
            .done(data => {
                doQuery(data)
            });
    }

    function doQuery(data) {
        var articles = (data.articles).length;
        var words = makeArrayFromEachElement_0(data.words);
        var sources = makeArrayFromEachElement_0(data.sources);
        var authors = makeArrayFromEachElement_0(data.authors);

        console.log("Articles: " + articles);
        console.log("Words: " + JSON.stringify(words));
        console.log("Sources: " + JSON.stringify(sources));
        console.log("Authors: " + JSON.stringify(authors));
        console.log("Word Cloud: " + JSON.stringify(data.wordcloud));

        result = {
            sources: sources,
            authors: authors,
            words: words
        };

        updatePage(result)

        
        // $.post("/api/articles/", query);
    }

    function initializePage() {
        $.get("/api/user/keith66fuller", function (userObj) {
            query = {
                sources: JSON.parse(userObj.sources),
                authors: null,
                words: []
            }
        
        }).then(function () {
            queryArticles()
        });
    }

    function updatePage(result) {
        [
            ["#word_sel", result.words],
            ["#author_sel", result.authors],
            ["#source_sel", result.sources]
        ].forEach(e => {
            selectUpdate(e[0], e[1])
        });
    }

    // At the very start, pull down the user object for the logged in user and set the "default" query to be only their default sources.
    initializePage();



    $('.btn-danger').on('click', initializePage);




    $('#source_sel').on('change', function (event) {
        query.sources = result.sources[this.selectedIndex-1];
        queryArticles();
    })

    $('#author_sel').on('change', function (event) {
        console.log("index: " + (this.selectedIndex - 1));
        query.authors = result.authors[this.selectedIndex-1];
        queryArticles();
    })

    $('#word_sel').on('change', function (event) {
        query.words = result.words[this.selectedIndex-1];
        queryArticles();
    })


})