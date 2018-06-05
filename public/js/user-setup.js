$(document).ready(function() {
  
    // SHOW NEWS SOURCES ON PAGE LOAD
    // =========================================

    // Getting the initial list of sources
    getSources();
    
    // Function for retrieving list of news sources and getting them ready to be rendered to the page
    function getSources() {
        $.get("/api/sources", function(data) {
            $(".news-sources-list").empty();
            var rowsToAdd = [];
            for (var i = 0; i < data.length; i++) {
            rowsToAdd.push(createSourcesRow(data[i]));
            }
        });
    }

    // Function for creating a new list row for each news source
    function createSourcesRow(sourcesData) {

        console.log(sourcesData);

        var newDiv = $("<div>");
        var $ctrl = $('<input/>').attr({ id: sourcesData.id, type: 'checkbox', name: sourcesData.name}).addClass("chk");
        $(newDiv).append($ctrl);
        $(newDiv).append("<label for=" + sourcesData.id + "> " + sourcesData.name + "</label>");
        $(".news-sources-list").append(newDiv);
    }

    // MAIN PROCESS WHEN SUBMIT BUTTON CLICKED
    // =========================================

    // when user presses submit button, run UserSetupFormSubmit function
    $(document).on("submit", ".user-setup", formSubmitted);

    // A function to handle what happens when the form is submitted to create a new Author
    function formSubmitted(event) {
        event.preventDefault();
        // check to see which checkboxes were selected by the user
        
        // grab this info and when user goes back to the main page, news sources are filtered to the ones selected
        // enter into user table
        // redirect to main.html
    }

});
  