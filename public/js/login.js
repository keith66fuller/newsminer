$(document).ready(function () {

    // var config = {
    //     apiKey: "AIzaSyDr59vCL72gV07FpEUyu61F8QZVdy4iEuY",
    //     authDomain: "fireauthen-1c11b.firebaseapp.com",
    //     databaseURL: "https://fireauthen-1c11b.firebaseio.com",
    //     projectId: "fireauthen-1c11b",
    //     storageBucket: "fireauthen-1c11b.appspot.com",
    //     messagingSenderId: "183413100827"
    // };

    // firebase.initializeApp(config);


    var config = {
        apiKey: "AIzaSyAay3IEcIfVqgYpo9NwTQDRWFBSmQuhW1c",
        authDomain: "news-miner-beefd.firebaseapp.com",
        databaseURL: "https://news-miner-beefd.firebaseio.com",
        projectId: "news-miner-beefd",
        storageBucket: "news-miner-beefd.appspot.com",
        messagingSenderId: "983822948368"
      };
      firebase.initializeApp(config);
    var database = firebase.database();


    $('#google-login').on('click', function () {
        event.preventDefault();
        var provider = new firebase.auth.GoogleAuthProvider();

        return firebase.auth().signInWithPopup(provider).then(function (result) {
            console.log("success");

            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;

            localStorage.setItem("uid", user.uid);
            localStorage.setItem("email", user.email);
            console.log(localStorage.uid);
            console.log(localStorage.email);
            $.get("/api/user/"+localStorage.uid, function (userObj) {
                console.log(userObj);
                if(userObj){window.location = './main.html';}
                else{window.location = './user-setup.html';}
            })
            // $.post("/api/user/"+localStorage.uid, function (userObj) {
            //     console.log(userObj);
            // })
            // window.location = './main.html';
            // ...
        })
            .catch(function (error) {
                console.log('Google sign in error', error);
            });
    });

    $('#github-login').on('click', function () {
        event.preventDefault();
        var provider = new firebase.auth.GithubAuthProvider();

        return firebase.auth().signInWithRedirect(provider).then(function (result) {
            localStorage.setItem("uid", user.uid);
            console.log(localStorage.uid);

            // This gives you a GitHub Access Token. You can use it to access the GitHub API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;

            window.location = './main.html';
            // ...
        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
        });
    });

    firebase.auth().onAuthStateChanged(function (firebaseUser) {
        if (firebaseUser) {
            console.log(firebaseUser);
        }
        else {
            console.log("not logged in");
        }
    });

    // }, function (errorObject) {
    //     console.log("The read failed: " + errorObject.code);
});