$(document).ready(function () {

    // SHOW NEWS SOURCES ON PAGE LOAD
    // =========================================

    // Getting the initial list of sources
    getSources();

    // Function for retrieving list of news sources and getting them ready to be rendered to the page
    function getSources() {
        $.get("/api/sources", function (data) {
            $(".news-sources-list").empty();
            var rowsToAdd = [];
            for (var i = 0; i < data.length; i++) {
                rowsToAdd.push(createSourcesRow(data[i]));
            }
        });
    }

    // Function for creating a new list row for each news source
    function createSourcesRow(sourcesData) {

        // console.log(sourcesData);

        var newDiv = $("<div>");
        var $ctrl = $('<input/>').attr({ type: 'checkbox', id: sourcesData.id, value: sourcesData.id, name: sourcesData.name }).addClass("Checkbox");
        $(newDiv).append($ctrl);
        $(newDiv).append("<label for=" + sourcesData.id + ">" + sourcesData.name + "</label>");
        $(".news-sources-list").append(newDiv);

        // addSelectAll();
    }

    function addSelectAll() {
        // add a 'select all' checkbox
        $(newDiv).append($ctrl);
        $(newDiv).append("<label>" + "Select All" + "</label>");
        $(".news-sources-list").prepend(selectAllCheckbox);
    }

    // $("#checkedAll").change(function () {
    //     if (this.checked) {
    //         $(".checkSingle").each(function () {
    //             this.checked = true;
    //         });
    //     } else {
    //         $(".checkSingle").each(function () {
    //             this.checked = false;
    //         });
    //     }
    // });

    // $(".checkSingle").click(function () {
    //     if ($(this).is(":checked")) {
    //         var isAllChecked = 0;

    //         $(".checkSingle").each(function () {
    //             if (!this.checked)
    //                 isAllChecked = 1;
    //         });

    //         if (isAllChecked == 0) {
    //             $("#checkedAll").prop("checked", true);
    //         }
    //     }
    //     else {
    //         $("#checkedAll").prop("checked", false);
    //     }
    // });

    // MAIN PROCESS WHEN SUBMIT BUTTON CLICKED
    // =========================================
    // $(".user-setup-submit").on("click", function () {
    //     // check to see which checkboxes were selected by the user
    //     // grab this info and create as a string/array
    //     var checklistString = $('.Checkbox:checked').map(function () {
    //         return this.value;
    //     }).get().join(',')
    //     console.log(checklistString);
    //     // enter these news sources into user table as a string
    //     // redirect user to main.html
    //     // $(location).attr('href', '/main.html')
    // });

    $("#exampleModal").on("click", function () {
        // check to see which checkboxes were selected by the user
        // grab this info and create as a string/array
        var checklistString = $('.Checkbox:checked').map(function () {
            return this.value;
        }).get()

        console.log("CHECKLISTSTRING: "+checklistString);

        checklistString.forEach((e,i) => {
            console.log("CLS: "+i+" "+e)
        });

        var newUser = {
            uid: localStorage.uid,
            username: $("#userName").val(),
            firstName: $("#firstName").val(),
            lastName: $("#lastName").val(),
            email: localStorage.email,
            sources: checklistString
        }

        console.log("NEWUSER: "+JSON.stringify(newUser, null,2));

        $.post("/api/user", newUser)
            .then(console.log("user created"));

        $(location).attr('href', '/main.html')
    });
});