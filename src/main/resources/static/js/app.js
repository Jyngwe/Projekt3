var stompClient = null;
var alias = null;
var aliasList = null;

function setConnected(connected) {
    $("#connect").prop("disabled", connected);
    $("#disconnect").prop("disabled", !connected);
    if (connected) {
        $("#conversation").show();
    }
    else {
        $("#conversation").hide();
    }
    $("#greetings").html("");
}

function connect() {
    alias = $("#alias").val();
    $("#login-content").hide();
    $("#options").show();
    var socket = new SockJS('/gs-guide-websocket');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        setConnected(true);
        console.log('Connected: ' + frame);
        stompClient.subscribe('/topic/greetings', function (greeting) {
            showGreeting(JSON.parse(greeting.body).content);
        });
        stompClient.subscribe('/topic/answers', function (greeting) {
            showAnswer(JSON.parse(greeting.body).content);
        });
        stompClient.subscribe('/topic/quiz', function (data){
            showQuestion(JSON.parse(data.body).content);

            });
        stompClient.subscribe('/topic/aliases', function (alias) {
            aliastList = JSON.parse(alias.body);
            showAliasList(aliastList);
        });
        stompClient.subscribe('/topic/results', function(s) {
            var winner  = s.body;
            showResults(winner);
            });
        sendNewAlias(alias);
        stompClient.send("/app/connect",{}, "connected");

    });
}

function disconnect() {
    if (stompClient != null) {
        stompClient.disconnect();
    }
    setConnected(false);
    console.log("Disconnected");
}

function showNextQuestion() {
    stompClient.send("/app/connect",{} )
}

function sendName() {
    stompClient.send("/app/hello", {}, JSON.stringify({'name': $("#name").val(), 'message': $("#message").val()}));}
function showGreeting(message) {
    $("#greetings").append("<tr><td>" + message + "</td></tr>");
}
function showAnswer(message) {
    $("#otherPlayers").append("<tr><td>" + message + "</td></tr>");

}
function showQuestion(data) {
    var obj = JSON.parse(data);

    $("#question").html(obj.question);
    $("th#options1").html(obj.text1);
    $("th#options2").html(obj.text2);
    $("th#options3").html(obj.text3);
    $("th#options4").html(obj.text4);
    $("#image").attr("src", obj.img_URL);
    $("table#options th").css("background-color", "cornflowerblue");
    $("table#options th").removeAttr('disabled');

}

function showResults(s) {
    $("#results").show();
    $("#options").hide();
    $("#image").attr("src", "");
    $("#question").hide();
    $("#highscore").html(s);
    setTimeout(disconnect, 10000);

}

function markAnswer(elem){
    $( "table#options th").css("background-color","cornflowerblue");
    elem.css("background-color","black");
    var sendVar = elem.attr("value");
    stompClient.send("/app/answer", {}, JSON.stringify({'optionSelected': sendVar, 'playerAlias': alias}));

}

function showAliasList(aliasList) {
    $("#aliases").html("");
    for(var i = 0; i<aliasList.length; i++) {
        console.log(aliasList[i].score);
        $("#aliases").append("<div>" + aliasList[i].alias + " " + aliasList[i].score +  "</div>");
}}
function sendNewAlias(alias){
    stompClient.send("/app/alias", {}, alias);
}

$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $( "#connect" ).click(function() { connect()});
    $( "#disconnect" ).click(function() { disconnect(); });
    $( "#send" ).click(function() { sendName(); });
    $( "table#options th" ).click(function() {
        if ($('table#options th').attr('disabled') == "disabled" )
            return false;
        else {
            markAnswer($(this));
            $("table#options th").attr('disabled', "disabled");
        }
        });

});


