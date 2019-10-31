$(document).ready(function () {
    Storage.prototype.setObj = function(key, obj) {
        return this.setItem(key, JSON.stringify(obj))
    }
    Storage.prototype.getObj = function(key) {
        return JSON.parse(this.getItem(key))
    }

    var config = {
        apiKey: "AIzaSyByX1cmYh12rRWMJD7oNelv4zZAvgSQb3U",
        authDomain: "newsminer-26561.firebaseapp.com",
        databaseURL: "https://newsminer-26561.firebaseio.com",
        projectId: "newsminer-26561",
        storageBucket: "newsminer-26561.appspot.com",
        messagingSenderId: "901938764289",
        appId: "1:901938764289:web:00dac6d5ab38be9f2e7e00",
        measurementId: "G-974BSKWPSK"
      };
    firebase.initializeApp(config);
    firebase.analytics();
    //var database = firebase.database();


    $('#google-login').on('click', function () {
        event.preventDefault();
        var provider = new firebase.auth.GoogleAuthProvider();

        return firebase.auth().signInWithPopup(provider).then(function (result) {
            console.log("success");

            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;

            localStorage.setObj("uid", user.uid);
            localStorage.setObj("email", user.email);
            console.log("UID: "+ localStorage.uid+" EMAIL: "+localStorage.email);
            $.get("/api/user/" + user.uid, function (userObj) {
                if (userObj) {
                    console.log("USEROBJ FROM DB: " + JSON.stringify(userObj));
                    window.location = './main.html';
                } else {
                    window.location = './user-setup.html'
                }
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
            localStorage.setObj("uid", user.uid);
            console.log(localStorage.uid);

            // This gives you a GitHub Access Token. You can use it to access the GitHub API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;

            window.location = './main.html';
            // ...
        }).catch(function (error) {
            // Handle Errors here.
            // var errorCode = error.code;
            // var errorMessage = error.message;
            // The email of the user's account used.
            // var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            // var credential = error.credential;
            // ...
        });
    });

    firebase.auth().onAuthStateChanged(function (firebaseUser) {
        if (firebaseUser) {
            console.log("LOGGED IN USER: " + JSON.stringify(firebaseUser, null, 2));
        }
        else {
            console.log("not logged in");
        }
    });

    // }, function (errorObject) {
    //     console.log("The read failed: " + errorObject.code);
});