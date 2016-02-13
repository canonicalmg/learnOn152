Contents = new Mongo.Collection("content");
//Meteor.subscribe('content');
if (Meteor.isClient) {
  // counter starts at 0
  //Session.setDefault('counter', 0);
  Meteor.startup(function() {

  });

  Tracker.autorun(function() {
    /* In order to perform query from server, must wait until db has been connected. Tracker.autorun waits for that to happen */

    var contentItem = Contents.find().fetch(); //.find for query; .fetch to get query as array
    if(contentItem.length <= 0) {
      Contents.insert(({topicName:"Csci40", topicContent:"Test content for this topic", topicVideo:"https://www.youtube.com/embed/PfPdtfbPsRw"}));
      Contents.insert(({topicName:"Csci41", topicContent:"Test content for this other topic", topicVideo:"https://www.youtube.com/embed/vh3tuL_DVsE"}));
    }
    else{
      for (var i = 0; i < contentItem.length; i++) { //making buttons for each content object. Used for dev until grid is built
        if ( !$( "#"+contentItem[i].topicName ).length ) {
          $("#panRight").append("<button class='contentButton' id='"+contentItem[i].topicName +"' value='"+contentItem[i]._id._str+"' type='button'>" + contentItem[i].topicName + "</button>");
        }
      }
    }

    $(".contentButton").click(function(){ //User is changing content
      var contentName = $(this).attr("id");
      var thisTask = Contents.findOne({topicName: contentName}); //redundant query at the moment, but plan on using a query later to restrict data to only be what is needed
      $("#topicName").html("<h1>" + thisTask.topicName +"</h1>");
      if(thisTask.topicVideo) { //if it has a video, display it
        $("#topicVideo").html("<iframe width='100%' height='100%' src='" + thisTask.topicVideo + "' frameborder='0' allowfullscreen></iframe>");
      }
      $("#topicContent").html("<h1>" + thisTask.topicContent +"</h1>");
    });

    $("#addNewContent").off('click').on('click', function(e){ //dev purposes. Messy way to allow us to add content easily
      e.preventDefault(); //prevents button from being clicked multiple times
      if($("#addNewContent").text() == "Add New Content") {
        $("#addNewContent").text("Save");
        $("#panRight").append("<div style='border:2px solid black' id='addNewTopic'>"
            + "<form id='usrform'>"
            + "<a style='color:white'>Name:</a> <input type='text' style='width:100%;' id='tName'> <br>"
            + "<a style='color:white'>Content:</a> <input type='text' style='width:100%;' id='tContent'> <br>"
            + "<a style='color:white'>URL:</a> <input type='text' style='width:100%;' id='tURL'>"
            + "</form></div>");

      }
      else if($("#addNewContent").text() == "Save"){
        $("#addNewContent").text("Add New Content");
        var tName = $('#tName').val();
        var tContent = $('#tContent').val();
        var tURL = $('#tURL').val();
        if((tName.length > 0) && (tContent.length > 0)) {
          Contents.insert(({topicName: tName, topicContent: tContent, topicVideo: tURL}));
        }
        $("#addNewTopic").remove()
      }
      //document.getElementById("saveAddNewTopic").addEventListener("click", saveNewTopic);
    });




  });

Accounts.ui.config({
   passwordSignupFields: "USERNAME_ONLY"
 });
}

if(Meteor.isServer) {
  Meteor.startup(function () {
    //Myvars = new Mongo.Collection("content");

    //really not sure if this is needed, but scared to take it out. Failsafe to ensure dependencies are met if no object exists
    if (Contents.find().count() == 0) {
      Contents.insert(({topicName:"Csci40", topicContent:"Test content for this topic", topicVideo:"https://www.youtube.com/embed/PfPdtfbPsRw"}));
    }

    Meteor.publish("content", function() {
      return Contents.find();
    });
  });
}
