const express = require("express");
const app = express();

/ * connect to mongoDB */;
//mongoose.js파일을 불러와야 app 실행시 db에 연결한다
const { mongoose } = require("./db/mongoose");

const bodyParser = require("body-parser");

/ * load in mongoos models * /;
const { List, Task } = require("./db/models");

/ * load middleware * /;
//add middleware that appends cors headers to (pre-flight?) responses
//이거 없으면 클라이언트에서 요청보냈을때 cors 오류남.
// //https://enable-cors.org/server_expressjs.html여기서 설정 긁어옴
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  // * 대신 http://localhost:4200 해도 작동함.
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(bodyParser.json());

/ * root handlers */;

/* list routes */
//GET /lists
//purpose: get all lists
app.get("/lists", (req, res) => {
  // return an array of all the lists in the db
  //모두 찾아 가져와야하므로 .find()의 조건이 비어있다
  List.find({}).then((lists) => {
    res.send(lists);
    /*
    [
      {
          "_id": "5f268988fd8910562070bcba",
          "title": "Buy Coffee",
          "__v": 0
      }
    ]
    */
  });
});

//POST /lists
//purpose: create a list
app.post("/lists", (req, res) => {
  //create a new list and return the new list document to the user (which includes the id)
  //the list information (fields) will be passed in via the JSON request body.
  /* req.body
  {
	  "title": "Buy Coffee"
  }
   */
  let title = req.body.title; //이 코드를 쓰려면 body-parser를 깔아야한다
  let newList = new List({ title });
  newList.save().then((listDoc) => {
    //! post할때는 id, -v등은 서버만 알고 요청보내는 쪽에서는 title만 알기 때문에 document 반환?
    res.send(listDoc); //req.body에는 title밖에 없었는데 자동 id 생성되는거 보면 //!id = auto generated?
    /*
    {
        "_id": "5f268988fd8910562070bcba",
        "title": "Buy Coffee",
        "__v": 0 //! what is this
    }
     */
  });
});

//POST /lists
//purpose: update a specified list
app.patch("/lists/:id", (req, res) => {
  //update the specified list (list document with id in the URL) with the new values
  //specified by the JSON body of the request
  List.findOneAndUpdate(
    { _id: req.params.id }, //요청보내는 URL ex) http://localhost:3000/lists/5f268988fd8910562070bcba
    {
      $set: req.body,
    }
  ).then(() => {
    res.sendStatus(200); // OK
    //req 보내는 쪽이 document에 대해 모르는 바가 없기때문에 document 반환 X.
  });
});

//DELETE /lists
//purpose: delete a list
app.delete("/lists/:id", (req, res) => {
  //delete the specified list
  List.findOneAndRemove({
    _id: req.params.id,
  }).then((removedListDoc) => {
    res.send(removedListDoc);
  });
});

//GET /lists/:listId/tasks
//purpose: get all tasks in a specific list
app.get("/lists/:listId/tasks", (req, res) => {
  //return all tasks that belong to specific list that is specified by listId
  Task.find({
    _listId: req.params.listId,
  }).then((tasks) => {
    res.send(tasks);
  });
});

//GET /lists/:listId/tasks/:taskId
//모든 task가 담긴 배열말고 그중에 taskId가 일치하는 하나의 task만 (아마도 JSON으로) 리턴
//이 앱에서 필요하진 않지만 알아두면 좋음
app.get("/lists/:listId/tasks/:taskId", (req, res) => {
  Task.findOne({
    _id: req.params.taskId,
    _listId: req.params.listId,
  }).then((task) => {
    res.send(task);
  });
});

//POST /lists/:listId/tasks
//purpose: create a new task in a specific list
app.post("/lists/:listId/tasks", (req, res) => {
  //create a new task in a list specified by listId
  let newTask = new Task({
    title: req.body.title,
    _listId: req.params.listId,
  });
  newTask.save().then((newTaskDoc) => {
    res.send(newTaskDoc);
    /*
    {
      "_id": "5f268fe828163f56847d0686",
      "title": "Get some rest",
      "_listId": "5f268e0a495b6318c04f68de",
      "__v": 0
    }
    */
  });
});

//PATCH /lists/:listId/tasks/:taskId
app.patch("/lists/:listId/tasks/:taskId", (req, res) => {
  //update an existing task (specified by taskId)
  console.log(req.body);
  Task.findOneAndUpdate(
    {
      _id: req.params.taskId,
      _listId: req.params.listId,
    },
    {
      $set: req.body,
    }
  ).then(() => {
    res.sendStatus(200); // 200은 잘 오는데 에러뜸. postman으로 해보면 OK 뜬다.
    //res.send({ message: "update successful" });
  });
});

// DELETE /lists/:listId/tasks/:taskId
//purpose: delete a task
app.delete("/lists/:listId/tasks/:taskId", (req, res) => {
  Task.findOneAndRemove({
    _id: req.params.taskId,
    _listId: req.params.listId,
  }).then((removedListDoc) => {
    res.send(removedListDoc);
  });
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
