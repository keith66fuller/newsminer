$(document).ready(function() {
  // Getting references to the name input and source container, as well as the table body
  var nameInput = $("#source-name");
  var sourceList = $("tbody");
  var sourceContainer = $(".source-container");
  // Adding event listeners to the form to create a new object, and the button to delete
  // an Source
  $(document).on("submit", "#source-form", handleSourceFormSubmit);
  $(document).on("click", ".delete-source", handleDeleteButtonPress);

  // Getting the initial list of Sources
  getSources();

  // A function to handle what happens when the form is submitted to create a new Source
  function handleSourceFormSubmit(event) {
    event.preventDefault();
    // Don't do anything if the name fields hasn't been filled out
    if (!nameInput.val().trim().trim()) {
      return;
    }
    // Calling the upsertSource function and passing in the value of the name input
    upsertSource({
      name: nameInput
        .val()
        .trim()
    });
  }

  // A function for creating an source. Calls getSources upon completion
  function upsertSource(sourceData) {
    $.post("/api/sources", sourceData)
      .then(getSources);
  }

  // Function for creating a new list row for sources
  function createSourceRow(sourceData) {
    var newTr = $("<tr>");
    newTr.data("source", sourceData);
    newTr.append("<td>" + sourceData.name + "</td>");
    newTr.append("<td> " + sourceData.Articles.length + "</td>");
    newTr.append("<td><a href='/blog?source_id=" + sourceData.id + "'>Go to Articles</a></td>");
    newTr.append("<td><a href='/cms?source_id=" + sourceData.id + "'>Create a Article</a></td>");
    newTr.append("<td><a style='cursor:pointer;color:red' class='delete-source'>Delete Source</a></td>");
    return newTr;
  }

  // Function for retrieving sources and getting them ready to be rendered to the page
  function getSources() {
    $.get("/api/sources", function(data) {
      var rowsToAdd = [];
      for (var i = 0; i < data.length; i++) {
        rowsToAdd.push(createSourceRow(data[i]));
      }
      renderSourceList(rowsToAdd);
      nameInput.val("");
    });
  }

  // A function for rendering the list of sources to the page
  function renderSourceList(rows) {
    sourceList.children().not(":last").remove();
    sourceContainer.children(".alert").remove();
    if (rows.length) {
      console.log(rows);
      sourceList.prepend(rows);
    }
    else {
      renderEmpty();
    }
  }

  // Function for handling what to render when there are no sources
  function renderEmpty() {
    var alertDiv = $("<div>");
    alertDiv.addClass("alert alert-danger");
    alertDiv.text("You must create an Source before you can create a Article.");
    sourceContainer.append(alertDiv);
  }

  // Function for handling what happens when the delete button is pressed
  function handleDeleteButtonPress() {
    var listItemData = $(this).parent("td").parent("tr").data("source");
    var id = listItemData.id;
    $.ajax({
      method: "DELETE",
      url: "/api/sources/" + id
    })
      .then(getSources);
  }
});
