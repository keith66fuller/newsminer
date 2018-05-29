$(document).ready(function() {
  /* global moment */

  // blogContainer holds all of our articles
  var blogContainer = $(".blog-container");
  var articleCategorySelect = $("#category");
  // Click events for the edit and delete buttons
  $(document).on("click", "button.delete", handleArticleDelete);
  $(document).on("click", "button.edit", handleArticleEdit);
  // Variable to hold our articles
  var articles;

  // The code below handles the case where we want to get blog articles for a specific source
  // Looks for a query param in the url for source_id
  var url = window.location.search;
  var sourceId;
  if (url.indexOf("?source_id=") !== -1) {
    sourceId = url.split("=")[1];
    getArticles(sourceId);
  }
  // If there's no sourceId we just get all articles as usual
  else {
    getArticles();
  }


  // This function grabs articles from the database and updates the view
  function getArticles(source) {
    sourceId = source || "";
    if (sourceId) {
      sourceId = "/?source_id=" + sourceId;
    }
    $.get("/api/articles" + sourceId, function(data) {
      console.log("Articles", data);
      articles = data;
      if (!articles || !articles.length) {
        displayEmpty(source);
      }
      else {
        initializeRows();
      }
    });
  }

  // This function does an API call to delete articles
  function deleteArticle(id) {
    $.ajax({
      method: "DELETE",
      url: "/api/articles/" + id
    })
      .then(function() {
        getArticles(articleCategorySelect.val());
      });
  }

  // InitializeRows handles appending all of our constructed article HTML inside blogContainer
  function initializeRows() {
    blogContainer.empty();
    var articlesToAdd = [];
    for (var i = 0; i < articles.length; i++) {
      articlesToAdd.push(createNewRow(articles[i]));
    }
    blogContainer.append(articlesToAdd);
  }

  // This function constructs a article's HTML
  function createNewRow(article) {
    var formattedDate = new Date(article.createdAt);
    formattedDate = moment(formattedDate).format("MMMM Do YYYY, h:mm:ss a");
    var newArticleCard = $("<div>");
    newArticleCard.addClass("card");
    var newArticleCardHeading = $("<div>");
    newArticleCardHeading.addClass("card-header");
    var deleteBtn = $("<button>");
    deleteBtn.text("x");
    deleteBtn.addClass("delete btn btn-danger");
    var editBtn = $("<button>");
    editBtn.text("EDIT");
    editBtn.addClass("edit btn btn-info");
    var newArticleTitle = $("<h2>");
    var newArticleDate = $("<small>");
    var newArticleSource = $("<h5>");
    newArticleSource.text("Written by: " + article.Source.name);
    newArticleSource.css({
      float: "right",
      color: "blue",
      "margin-top":
      "-10px"
    });
    var newArticleCardBody = $("<div>");
    newArticleCardBody.addClass("card-body");
    var newArticleBody = $("<p>");
    newArticleTitle.text(article.title + " ");
    newArticleBody.text(article.body);
    newArticleDate.text(formattedDate);
    newArticleTitle.append(newArticleDate);
    newArticleCardHeading.append(deleteBtn);
    newArticleCardHeading.append(editBtn);
    newArticleCardHeading.append(newArticleTitle);
    newArticleCardHeading.append(newArticleSource);
    newArticleCardBody.append(newArticleBody);
    newArticleCard.append(newArticleCardHeading);
    newArticleCard.append(newArticleCardBody);
    newArticleCard.data("article", article);
    return newArticleCard;
  }

  // This function figures out which article we want to delete and then calls deleteArticle
  function handleArticleDelete() {
    var currentArticle = $(this)
      .parent()
      .parent()
      .data("article");
    deleteArticle(currentArticle.id);
  }

  // This function figures out which article we want to edit and takes it to the appropriate url
  function handleArticleEdit() {
    var currentArticle = $(this)
      .parent()
      .parent()
      .data("article");
    window.location.href = "/cms?article_id=" + currentArticle.id;
  }

  // This function displays a message when there are no articles
  function displayEmpty(id) {
    var query = window.location.search;
    var partial = "";
    if (id) {
      partial = " for Source #" + id;
    }
    blogContainer.empty();
    var messageH2 = $("<h2>");
    messageH2.css({ "text-align": "center", "margin-top": "50px" });
    messageH2.html("No articles yet" + partial + ", navigate <a href='/cms" + query +
    "'>here</a> in order to get started.");
    blogContainer.append(messageH2);
  }

});
