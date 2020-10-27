const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
let uri = require('./config/db').dbConnection
mongoose.connect(uri, {useUnifiedTopology: true});

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


//Schema new user
const { Schema } = mongoose
const addUser = new Schema({
    username: {
        type: String,
        required: true
    },
    log: []
})
const User = mongoose.model('User', addUser)

//Schema add exercice
const exercice = new Schema({
  _id: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: String
})
const Exercice = mongoose.model('Exercice', exercice)

//1 create a user and returned an object with username and _id
app.post("/api/exercise/new-user", (req, res) => {
  const { username } = req.body
    const addNewUser = new User({
      username
    })
      .save( (err, data) => {
        if(err) console.log(err);
        res.json(data);
      });
      
});

//2 get all users
app.get("/api/exercise/users", (req, res) => {
    User.find( (err, data) => {
      if(err) console.log(err)
      res.json(data)
    });
});

//3 add an exercise to any user by posting form data userId
//5f985347e8942601fabffedb
app.post("/api/exercise/add", (req, res) => {
  const { userId, description, duration, date } = req.body;

  const addNewExercice = new Exercice({
    description,
    duration: parseInt(duration),
    date,
  });

   if(addNewExercice.date === ''){
    addNewExercice.date = new Date().toISOString().substring(0, 10);
  }

  User.findByIdAndUpdate(
    userId,
    { $push: { log: addNewExercice } },
    { new: true },
    (err, update) => {
      let newUserData = {};
      newUserData["_id"] = update.id
      newUserData["username"] = update.username
      newUserData["description"] = addNewExercice.description
      newUserData["duration"] = addNewExercice.duration
      newUserData["date"] = new Date(addNewExercice.date).toDateString()
      res.json(newUserData);
    }
  );
});

//4  retrieve a full exercise log of any user
app.get('/api/exercise/log', (req, res) => {
  User.findById(req.query.userId, (err, data) => {
    if(err) console.log(err);
    let response = data
//5 retrieve part of the log of any user 
   
    if(req.query.from || req.query.to){
      let fromDate = new Date(0)
      let toDate = new Date()

      if(req.query.from){
        fromDate = new Date(req.query.from)
      }

      if(req.query.to){
        toDate = new Date(req.query.to)
      }

      fromDate = formDate.getTime()
      toDate = toDate.getTime()

      response.log = response.log.filter( (Exercice) => {
        let newSessionDate = new Date(Exercice.date).getTime()
        return newSessionDate >= fromDate && newSessionDate <= toDate
      })
    }
     if(req.query.limit){
      response.log = response.log.slice(0, req.query.limit)
    }


    response['count'] = data.log.length
    res.json(response)
  }); 
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
