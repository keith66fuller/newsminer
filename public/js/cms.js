$(document).ready(function() {
  // Getting jQuery references to the article body, title, form, and source select
  var bodyInput = $("#body");
  var titleInput = $("#title");
  var cmsForm = $("#cms");
  var sourceSelect = $("#source");
  // Adding an event listener for when the form is submitted
  $(cmsForm).on("submit", handleFormSubmit);
  // Gets the part of the url that comes after the "?" (which we have if we're updating a article)
  var url = window.location.search;
  var articleId;
  var sourceId;
  // Sets a flag for whether or not we're updating a article to be false initially
  var updating = false;

  // If we have this section in our url, we pull out the article id from the url
  // In '?article_id=1', articleId is 1
  if (url.indexOf("?article_id=") !== -1) {
    articleId = url.split("=")[1];
    getArticleData(articleId, "article");
  }
  // Otherwise if we have an source_id in our url, preset the source select box to be our Source
  else if (url.indexOf("?source_id=") !== -1) {
    sourceId = url.split("=")[1];
  }

  // Getting the sources, and their articles
  getSources();

  // A function for handling what happens when the form to create a new article is submitted
  function handleFormSubmit(event) {
    event.preventDefault();
    // Wont submit the article if we are missing a body, title, or source
    if (!titleInput.val().trim() || !bodyInput.val().trim() || !sourceSelect.val()) {
      return;
    }
    // Constructing a newArticle object to hand to the database
    var newArticle = {
      title: titleInput
        .val()
        .trim(),
      body: bodyInput
        .val()
        .trim(),
      SourceId: sourceSelect.val()
    };

    // If we're updating a article run updateArticle to update a article
    // Otherwise run submitArticle to create a whole new article
    if (updating) {
      newArticle.id = articleId;
      updateArticle(newArticle);
    }
    else {
      submitArticle(newArticle);
    }
  }

  // Submits a new article and brings user to blog page upon completion
  function submitArticle(article) {
    $.article("/api/articles", article, function() {
      window.location.href = "/blog";
    });
  }

  // Gets article data for the current article if we're editing, or if we're adding to an source's existing articles
  function getArticleData(id, type) {
    var queryUrl;
    switch (type) {
    case "article":
      queryUrl = "/api/articles/" + id;
      break;
    case "source":
      queryUrl = "/api/sources/" + id;
      break;
    default:
      return;
    }
    $.get(queryUrl, function(data) {
      if (data) {
        console.log(data.SourceId || data.id);
        // If this article exists, prefill our cms forms with its data
        titleInput.val(data.title);
        bodyInput.val(data.body);
        sourceId = data.SourceId || data.id;
        // If we have a article with this id, set a flag for us to know to update the article
        // when we hit submit
        updating = true;
      }
    });
  }

  // A function to get Sources and then render our list of Sources
  function getSources() {
    $.get("/api/sources", renderSourceList);
  }
  // Function to either render a list of sources, or if there are none, direct the user to the page
  // to create an source first
  function renderSourceList(data) {
    if (!data.length) {
      window.location.href = "/sources";
    }
    $(".hidden").removeClass("hidden");
    var rowsToAdd = [];
    for (var i = 0; i < data.length; i++) {
      rowsToAdd.push(createSourceRow(data[i]));
    }
    sourceSelect.empty();
    console.log(rowsToAdd);
    console.log(sourceSelect);
    sourceSelect.append(rowsToAdd);
    sourceSelect.val(sourceId);
  }

  // Creates the source options in the dropdown
  function createSourceRow(source) {
    var listOption = $("<option>");
    listOption.attr("value", source.id);
    listOption.text(source.name);
    return listOption;
  }

  // Update a given article, bring user to the blog page when done
  function updateArticle(article) {
    $.ajax({
      method: "PUT",
      url: "/api/articles",
      data: article
    })
      .then(function() {
        window.location.href = "/blog";
      });
  }
});
