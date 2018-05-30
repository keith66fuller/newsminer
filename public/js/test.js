$(document).ready(function () {
    function makeArrayFromEachElement_0(arr) {
        return arr.map(element => element[0])
    }




    $('.goButton').on('click', handleFormSubmit)

    function handleFormSubmit(event) {
        event.preventDefault();

        $.ajax({
                method: "POST",
                url: "/api/articles/"
            })
            .done(data => {
                // console.log(JSON.stringify(data))

                // Create an array of words
                var words   = makeArrayFromEachElement_0(data.words)
                var sources = makeArrayFromEachElement_0(data.sources)
                var authors = makeArrayFromEachElement_0(data.authors)

                console.log("Words: "+JSON.stringify(words))
                console.log("Sources: "+JSON.stringify(sources))
                console.log("Authors: "+JSON.stringify(authors))
            });

    }















})