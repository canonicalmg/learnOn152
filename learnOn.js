Topics = new Mongo.Collection("topic");
Contents = new Mongo.Collection("content");
Children = new Mongo.Collection("children");
if (Meteor.isClient) {

  function addTopic(){ //note 'save' button must be clicked. enter does not work
      console.log("clicked");
      if($("#addNewTopic").text() == "Add New Topic") {
        $("#addNewTopic").text("Save Topic");
        $(".contentButtons").append("<div style='border:2px solid black' id='addNewTopicForm'>"
            + "<form id='usrform'>"
            + "<a style='color:white'>Name:</a> <input type='text' style='width:100%;' id='tName'> <br>"
            + "<a style='color:white'>Parent(s):</a> <input type='text' style='width:100%;' id='tParent'> <br>"
            + "</form></div>");
      }
      else if($("#addNewTopic").text() == "Save Topic"){
        $("#addNewTopic").text("Add New Topic");
        var tName = $('#tName').val();

        if(!(existenceCheck(tName))) {

          //generate random loc
          var randomLoc = checkLocation();
          //If loc does not exist: insert topic into db

          //check if parents exist
          var parents = $('#tParent').val().split(',');
          for(var i=0; i  < parents.length; i++){
            console.log("parent: ", i, parents[i]);
            if(!(existenceCheck(parents[i]))){
              alert(parents[i] + " Does not exist");
            }
          }
          Topics.insert(({topicName: tName, locX: randomLoc.X, locY: randomLoc.Y}));
          for(var i=0; i < parents.length; i++){
            Children.insert(({Parent: parents[i], Children:tName}))
          }
        }
        else{
          alert("Topic already exists");
        }
        $("#addNewTopicForm").remove();
      }
  }

  function existenceCheck(tName){
    var existenceCheck = Topics.find({topicName:tName}).fetch();
    if(existenceCheck.length > 0){
      //alert("Topic already exists");
      return true;
    }
    else{
      return false;
    }
  }

  function checkLocation(){
    console.log("CheckLocation entered");
    var randomX = (Math.floor(Math.random() * 1000) + 1  );
    var randomY = (Math.floor(Math.random() * 1000) + 1  );
    var locCheck = Topics.find({"locX":randomX, "locY":randomY}).fetch();
    if(locCheck.length > 0){
      //If loc exists: generate new loc
      checkLocation();
    }
    else{
      console.log("returning with new XY", randomX, randomY);
      return {"X":randomX, "Y": randomY};
    }
  }

  function getTopicButtons(){
    var topicItem = Topics.find().fetch();
    if(topicItem.length <= 0) {
      console.log("in if");
      //Topics.insert(({topicName:"Csci40"}));
      $("#addNewTopic").click(function(e) {
        console.log("clicked");
        e.preventDefault(); //prevents button from being clicked multiple times
        addTopic();
      });
    }
    else{
      console.log("in else");
      for (var i = 0; i < topicItem.length; i++) { //making buttons for each content object. Used for dev until grid is built
        if ( !$( "#"+topicItem[i].topicName ).length ) {
          console.log("Adding topic");
          $(".topicButtons").append("<button class='topicButton' id='"+topicItem[i].topicName +"' value='"+topicItem[i]._id._str+"' type='button'>" + topicItem[i].topicName + "</button>");
          console.log("added topic");
        }
      }
    }
  }

  function generateGrid(tName){
    $( document ).ready(function() {
      console.log("doc ready");
      $("#content-graph").html('');
      var i,
          s,
          nCounter = 0,
          N = 10,
          E = 10,
          g = {
            nodes: [],
            edges: []
          };
      //take all nodes related to selected node
      //each node has a label of contentName, and maybe an ID of contentID
      //consider sticking nodes within some specific columns. Graph space is split int 5 different columns, X,Y random values
      //    are split into one of these 5 columns

      var existenceCheck = Topics.findOne({topicName:tName});
      var topicID = existenceCheck._id;
      g.nodes.push({
        id:topicID,
        label: existenceCheck.topicName,
        x: existenceCheck.locX,
        y: existenceCheck.locY,
        size: 10,
        color: '#' + Math.random().toString(16).slice(2, 8).toUpperCase()
      });
      var topicParents = Children.find({Children: tName}).fetch();
      var thisParent;
      for(var i=0; i <  topicParents.length; i++){
        thisParent = Topics.findOne({topicName: topicParents[i].Parent});
        g.nodes.push({
          id:thisParent._id,
          label: thisParent.topicName,
          x: thisParent.locX,
          y: thisParent.locY,
          size: 5,
          color: '#' + Math.random().toString(16).slice(2, 8).toUpperCase()
        });
        g.edges.push({
          id: "ep" + i,
          source: thisParent._id,
          target: topicID,
          size: '5',
          type: 'curve',
          color: '#ffffff',
          hover_color: '#000'
        })
      }
      var topicChildren = Children.find({Parent: tName}).fetch();
      var thisChild;
      for(var i=0; i <  topicChildren.length; i++){
        thisChild = Topics.findOne({topicName: topicChildren[i].Children});
        g.nodes.push({
          id:thisChild._id,
          label: thisChild.topicName,
          x: thisChild.locX,
          y: thisChild.locY,
          size: 2,
          color: '#' + Math.random().toString(16).slice(2, 8).toUpperCase()
        });
        g.edges.push({
          id: "ec" + i,
          source: thisChild._id,
          target: topicID,
          size: '2',
          type: 'curve',
          color: '#000000',
          hover_color: '#000'
        })
      }





      //Display parent of node
      //Display children of node

      /*for (i = 0; i < N; i++) {
        nCounter++;
        //console.log("rand # = ", ((Math.random()*100)|15));
        console.log("rand #2 = ", (Math.floor(Math.random() * 1000) + 1  ));
        g.nodes.push({
          id: 'n' + i,
          label: 'Node ' + i,
          x: (Math.floor(Math.random() * 4) + 1  ),
          y: (Math.floor(Math.random() * 4) + 1  ),
          size: 4,
          color: '#' + Math.random().toString(16).slice(2, 8).toUpperCase()
        });
      }*/
      /*for (i = 0; i < E; i++)
        g.edges.push({
          id: 'e' + i,
          source: 'n' + (Math.random() * N | 0),
          target: 'n' + (Math.random() * N | 0),
          size: Math.random(),
          type: 'curve',
          color: '#ffffff',
          hover_color: '#000'
        });*/
      s = new sigma({
        graph: g,
        renderer: {
          container: document.getElementById('content-graph'),
          type: 'canvas'
        },
        settings: {
          doubleClickEnabled: false,
          minEdgeSize: 0.5,
          maxEdgeSize: 2,
          enableEdgeHovering: true,
          edgeHoverColor: 'edge',
          defaultEdgeHoverColor: '#000',
          edgeHoverSizeRatio: 1,
          edgeHoverExtremities: true,
        }
      });
      // Bind the events:
      s.bind('clickNode', function(e) {
        console.log(e.type, e.data.node.label, e.data.captor);
      });
      s.bind('clickEdge', function(e) {
        console.log(e.type, e.data.edge, e.data.captor);
      });
  });
  }

  function topicSelect(e){
    console.log("TOPIC NAME?: ",e.currentTarget.outerText);
    generateGrid(e.currentTarget.outerText);
    function contentButtonClick(k){
      var contentName = this.getAttribute ("value");
      var thisTask = Contents.findOne({contentName: contentName}); //redundant query at the moment, but plan on using a query later to restrict data to only be what is needed
      if(thisTask.topicVideo) { //if it has a video, display it
        $("#topicVideo").html("<iframe width='100%' height='100%' src='" + thisTask.topicVideo + "' frameborder='0' allowfullscreen></iframe>");
      }
      $("#topicContent").html("<h1>" + thisTask.topicContent +"</h1>");
    }

    function contentUpButtonClick(k){
      var contentID = this.getAttribute ("value");
      var thisTask = Contents.findOne({_id: contentID}); //redundant query at the moment, but plan on using a query later to restrict data to only be what is needed
      Contents.update(thisTask._id, {$set: {upVote: thisTask.upVote + 1}}); //update value accordingly
      $("#"+contentID+"U").html("UP ("+ (thisTask.upVote + 1) + ")"); //redisplay value //"UP ("+ thisTask.upVote + ")"
    }
    function contentDownButtonClick(k){
      var contentID = this.getAttribute ("value");
      var thisTask = Contents.findOne({_id: contentID}); //redundant query at the moment, but plan on using a query later to restrict data to only be what is needed
      Contents.update(thisTask._id, {$set: {downVote: thisTask.downVote + 1}}); //update value accordingly
      $("#"+contentID+"D").html("DOWN ("+ (thisTask.downVote + 1) + ")");
    }

    $(".contentButtons").html("<p>Content buttons for development. Corresponding to topic buttons</p>");
    var topicName = e.target.id;
    var thisTask = Topics.findOne({topicName: topicName}); //redundant query at the moment, but plan on using a query later to restrict data to only be what is needed
    $("#topicName").html("<h1>" + thisTask.topicName +"</h1>");


    var contentItem = Contents.find({topicName:topicName}, {sort:{ upVote: -1 }}).fetch(); //.find for query; .fetch to get query as array
    if(contentItem.length <= 0) {
      //Contents.insert(({topicName:"Csci40", contentName:"test", contentContent:"Test content for this topic", contentVideo:"https://www.youtube.com/embed/PfPdtfbPsRw", upVote:0, downVote:0}));
    }
    else{
      for (var i = 0; i < contentItem.length; i++) { //making buttons for each content object. Used for dev until grid is built
        if ( !$( "#"+contentItem[i].contentName+"C" ).length ) {
          $(".contentButtons").append("<button class='contentButton' id='"+contentItem[i].contentName +"C' value='"+contentItem[i].contentName+"' type='button'>" + contentItem[i].contentName + "</button>"
          + "&nbsp;<button class='upVote' id='"+contentItem[i]._id +"U' value='"+contentItem[i]._id+"'>UP (" + contentItem[i].upVote+")</button>" //upvote downvote for this content
          + "&nbsp;<button class='downVote' id='"+contentItem[i]._id +"D' value='"+contentItem[i]._id+"'>DOWN (" + contentItem[i].downVote+")</button></br>"); //upvote downvote for this content
          document.getElementById(contentItem[i]._id +"U").addEventListener ("click", contentUpButtonClick, false);
          document.getElementById(contentItem[i]._id +"D").addEventListener ("click", contentDownButtonClick, false);
          document.getElementById(contentItem[i].contentName +"C").addEventListener ("click", contentButtonClick, false); //attach listener to button
        }
      }
    }
  }

  function addContent(){
    if($("#addNewContent").text() == "Add New Content") {
      $("#addNewContent").text("Save Content");
      $(".contentButtons").append("<div style='border:2px solid black' id='addNewContentForm'>"
          + "<form id='usrform'>"
          + "<a style='color:white'>Topic Name:</a> <input type='text' style='width:100%;' id='tName'> <br>" //make this dropdown?
          + "<a style='color:white'>Content Name:</a> <input type='text' style='width:100%;' id='cName'> <br>"
          + "<a style='color:white'>Content:</a> <input type='text' style='width:100%;' id='tContent'> <br>"
          + "<a style='color:white'>URL:</a> <input type='text' style='width:100%;' id='tURL'>"
          + "</form></div>");

    }
    else if($("#addNewContent").text() == "Save Content"){
      $("#addNewContent").text("Add New Content");
      var tName = $('#tName').val();
      var cName = $('#cName').val();
      var tContent = $('#tContent').val();
      var tURL = $('#tURL').val();
      if (!(tURL.indexOf("/embed/") > -1)){ //if url does not contain "/embed/"
        if (tURL.indexOf("/watch?") > -1){ //if url is a youtube page
          var splitURL = tURL.split("/watch?v=");
          var videoID = splitURL[1];
          tURL = "https://www.youtube.com/embed/" + videoID;
        }
      }
      if((tName.length > 0) && (tContent.length > 0)) {
        Contents.insert(({topicName: tName,contentName:cName, topicContent: tContent, topicVideo: tURL, upVote:0, downVote:0}));
      }
      $("#addNewContentForm").remove()
    }
  }

  Meteor.startup(function() {

  });

  Template.body.helpers({
    subjects: function(){
      return Contents.find();
    }
  });

  Template.rank.events({
    'click .upVote': function(){
      Contents.update(this._id, {$set: {upVote: this.upVote + 1}});
    },

    'click .downVote': function(){
      Contents.update(this._id, {$set: {downVote: this.downVote + 1}});
    }
  });
  
  

  Tracker.autorun(function() { //main controller


    /* In order to perform query from server, must wait until db has been connected. Tracker.autorun waits for that to happen */

    //retrieve topics
    getTopicButtons();

    //add new topic
    $("#addNewTopic").off('click').on('click', function(e){
      e.preventDefault(); //prevents button from being clicked multiple times
      addTopic();
    });

    //user clicks topic
    $(".topicButton").click(function(e){ //User is changing content
      topicSelect(e); //Display contents for topic
    });

    //user is adding new content
    $("#addNewContent").off('click').on('click', function(e){ //dev purposes. Messy way to allow us to add content easily
      e.preventDefault(); //prevents button from being clicked multiple times
      addContent();
    });

    $("#home").off('click').on('click', function(e){
      e.preventDefault();
      getTopicButtons();
      $("#addNewTopicForm").remove("");
      $("#addNewTopic").text("Add New Topic");
      $("#addNewContentForm").remove("");
      $("#addNewContent").text("Add New Content");
      $(".contentButtons").remove("");
      $("#content-graph").remove("");
      console.log('clicked home');
    })
  });



Accounts.ui.config({
   passwordSignupFields: "USERNAME_ONLY"
 });
}

if(Meteor.isServer) {
  Meteor.startup(function () {
    if (Contents.find().count() == 0) {
      Contents.insert(({topicName:"Csci40", contentName:"Csci40 Content 1", topicContent:"Test content for this topic", topicVideo:"https://www.youtube.com/embed/PfPdtfbPsRw", upVote:0, downVote:0}));
      Contents.insert(({topicName:"Csci40", contentName:"Csci40 Content 2", topicContent:"Test content for this topic", topicVideo:"https://www.youtube.com/embed/InnRJIGfLFU", upVote:0, downVote:0}));
      Contents.insert(({topicName:"Csci41", contentName:"Csci41 Content 1", topicContent:"Test content for this other topic", topicVideo:"https://www.youtube.com/embed/vh3tuL_DVsE", upVote:0, downVote:0}));
    }
    if(Topics.find().count() == 0){
      Topics.insert(({topicName:"Csci40"}));
      Topics.insert(({topicName:"Csci41"}));
    }

    Meteor.publish("content", function() {
      return Contents.find();
    });
  });
}
