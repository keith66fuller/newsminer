$(document).ready(function () {
    var query = {
        sources: [],
        authors: null,
        words: []
    }

    function makeArrayFromEachElement_0(arr) {
        return arr.map(element => element[0])
    }

    $.get("/api/user/keith66fuller", function (userObj) {
        query.sources = JSON.parse(userObj.sources)
    })


    $('.goButton').on('click', function (event) {
        event.preventDefault();
        console.log("QUERY: " + JSON.stringify(query, null, 2))
        $.post("/api/articles/", query)
            .done(data => {
                doQuery(data)
            });
    });

    $('#source_sel').on('change', function (event) {
        console.log(query.sources[this.selectedIndex - 1])
        query.sources = query.sources.slice(this.selectedIndex - 1, this.selectedIndex )
        console.log("New sources: "+query.sources)
        $.post("/api/articles/", query)
        .done(data => {
            doQuery(data)
        });
    })

    $('#author_sel').on('change', function (event) {
        console.log(query.authors[this.selectedIndex - 1])
        query.authors = query.authors.slice(this.selectedIndex - 1, this.selectedIndex )
        console.log("New authors: "+query.authors)
        $.post("/api/articles/", query)
        .done(data => {
            doQuery(data)
        });
    })

    function doQuery(data) {
        // console.log(JSON.stringify(data))

        // Create 3 arrays
        var words = makeArrayFromEachElement_0(data.words)
        var sources = makeArrayFromEachElement_0(data.sources)
        var authors = makeArrayFromEachElement_0(data.authors)

        console.log("Words: " + JSON.stringify(words))
        console.log("Sources: " + JSON.stringify(sources))
        console.log("Authors: " + JSON.stringify(authors))

        query.authors = data.authors

        $('#word_sel').empty()
        words.forEach(word => {
            $('#word_sel').append($('<option>').text(word))
        });

        $('#author_sel').empty()
        authors.forEach(author => {
            $('#author_sel').append($('<option>').text(author))
        });

        $('#source_sel').empty()
        sources.forEach(source => {
            $('#source_sel').append($('<option>').text(source))
        });

        $.post("/api/articles/", query)
    }
})