require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const http = require('http');
const hbs = require("hbs");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const bcryptjs = require("bcrypt");
const UserModal = require("./modals/userModal");
const PostModal = require("./modals/postModal");
const NotesModal = require("./modals/notesModal");
const ChatModal = require("./modals/chatModal");
const FitModal = require("./modals/fitPostModal");
const auth = require("./auth/auth");
const { notes, users, fits, chats } = require("./multer/multer");
// const transporter = require("./mailconfig/mail");
const { bytesToKB } = require("./functions/functions");
const PORT = 80;
const DOMAIN = '172.31.33.147';
const nodemailer = require("nodemailer");
const { google } = require('googleapis');
const fs = require("fs");
const colleges =
[{"college":'meerut college meerut',
"image":'meerut-college-meerut_owler_20160302_223540_original.png'},
{"college":'d. n. degree college meerut',
"image":'dn.jpg'},
{"college":'raghunath girl’s post graduate college',
"image":'rgpg.png'
},

{"college": 'n a s college meerut',
"image":'nas.jpg'
},
{"college":  'miet college',
"image": 'miet.jpg'},
  // {"college":'Swami Vivekanand Subharti University',
  // "image":''
//},
{"college":  'chaudhary charan singh university',
"image":'ccsu.png'
},
{"college": 'subharti university',
"image":'shubharti.jpg'
},
{"college":'iimt university',
"image":'iimtlogo.jpg'}
];

const CLIENT_ID = '892824393780-v7nfrinpjcnlsddprlea95s4u16gqd4j.apps.googleusercontent.com';
const CLEINT_SECRET = 'TbsO0wZnI5nNAciUdIdvCWeL';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04UvDWQggG_BFCgYIARAAGAQSNwF-L9Irzfh9FJWttpbxgfs-4xjob4uFxxsX4fpJOyonIrpfpTj3OhWVFriAfFfZBd-Ppeb_FGs';

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });







var readHTMLFile = function (path, callback) {
  fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
    if (err) {
      throw err;
      callback(err);
    } else {
      callback(null, html);
    }
  });
};

app.listen(PORT, DOMAIN, () => {
  console.log("Listening at " + PORT);
});
app.engine("hbs", hbs.__express);
const websitePath = path.join("./");
app.use(express.static(websitePath));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json());
app.set("view engine", "hbs");

mongoose.connect(
  process.env.MONGO_URL,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  function (err) {
    if (err) throw err;
    console.log("monogodb connected");
  }
);

hbs.registerHelper(
  "containsparam",
  function (mimetype, destination, originalname) {
    if (mimetype && mimetype.includes("video"))
      return `<video src='${destination}/${originalname}' class='img-fluid1' controls></video>`;
    else if (mimetype === undefined) return `<br/>`;
    else
      return `<img src='${destination}/${originalname}' alt='banner-img' class='img-fluid1'>`;
  }
);

hbs.registerHelper("ifEquals", function (arg1, arg2, options) {
  console.log(arg1, arg2);
  return arg1 != arg2 ? options.fn(this) : options.inverse(this);
});

var host,rand;
app.get("/termsofuse", (req, res) => {
  res.render("termsofuse");
});
app.get("/privacy", (req, res) => {
  res.render("privacypolicy");
});
app.get("/", auth, async (req, res) => {
  if(req.cookies["image"])
 {res.cookie("college", "", { expires: new Date(Date.now()) });
  res.cookie("image", "", { expires: new Date(Date.now()) });}
  const userId = req.cookies["user"];
  const user = await UserModal.findById(userId);
  const college = user.collegeName;
  const fits = await FitModal.find({ college: college }).sort({ _id: -1 });
  res.cookie("college", user.collegeName);
  hbs.registerHelper("likeordislike", function (likesArr, id) {
    if (likesArr.includes(user.userName)) {
      return `<a class="btn like" onclick="likeDislike(event,'${id}')">`;
    } else {
      return `<a class="btn dislike" onclick="likeDislike(event,'${id}')">`;
    }
  });
  res.render("index", { fits: fits });
});
app.get("/jump", auth, async (req, res) => {
  const college = req.cookies["college"];
  const fits = await FitModal.find({ college: college }).sort({ _id: -1 });
  const userId = req.cookies["user"];
  const user = await UserModal.findById(userId);
  hbs.registerHelper("likeordislike", function (likesArr, id) {
    if (likesArr.includes(user.userName)) {
      return `<a class="btn like" onclick="likeDislike(event,'${id}')">`;
    } else {
      return `<a class="btn dislike" onclick="likeDislike(event,'${id}')">`;
    }
  });
  res.render("jump", { fits: fits });
});
app.get("/notesinfo", auth, (req, res) => {
  res.render("notesinfo");
});
app.get("/uploadnotes", auth, (req, res) => {
  const { filename, filepages } = req.query;
  res.render("upload", {
    fileName: filename,
    filePages: filepages,
  });
});
app.get("/announcement", auth, (req, res) => {
  PostModal.find({}, (err, result) => {
    if (err) console.log(err);
    else {
      // console.log(result[0].comments);
      res.render("announcement", { posts: result });
    }
  });
});
app.post("/announcement", auth, (req, res) => {
  // get data from url while submitting form
  const { userName, message, collegeName } = req.body;

  if (userName !== "" && collegeName !== "") {
    //   creating new document
    const post = new PostModal({
      userName,
      message,
      collegeName,
    });

    // uploading post to posts collection
    post.save((err) => {
      if (err) console.log("Something wrong while uploading your post");
      res.render("announcement");
    });
  } else {
    console.log("Collegename and Username can not be empty");
  }
});
app.post("/comment", auth, async (req) => {
  const postId = req.body.postId;
  const comment = req.body.comment;

  // updating comments
  await PostModal.findOneAndUpdate(
    { _id: postId },
    {
      $push: {
        comments: {
          whoComment: "loggedinuer",
          comment: comment,
        },
      },
    }
  );

  // count comments
  let count = 0;
  await PostModal.findOne({ _id: postId }, (err, res) => {
    res.comments.map(() => {
      count++;
    });
  });

  // update comments count
  await PostModal.findOneAndUpdate(
    { _id: postId },
    {
      $set: {
        commentsCount: count,
      },
    }
  );
});
app.get("/studynotes", auth, async (req, res) => {
  var college= req.cookies["college"];
  var user= req.cookies["user"];
  var users= await UserModal.find({collegeName: college});
  var usr=[];
  var notesList=[];
    users.forEach(myfunction);
    function myfunction(item,index,arr){
      usr.push(arr[index].userName);
    }
    var notes=await NotesModal.find({});
    notes.forEach(myfunction2);
    function myfunction2(item,index,arr){
      if(usr.includes(arr[index].user))
      { notesList.push(arr[index]);
      }
    }
    var loggedinuer=await UserModal.findById(user);
    if(loggedinuer.collegeName==college){
  res.render("study notes", { notesList, college} );
    }
    else{
      res.render("study note", { notesList, college} );
    }
});
app.get("/upload", auth, (req, res) => {
  NotesModal.find({}, (err, result) => {
    result = bytesToKB(result);
    res.render("upload", { notesList: result });
  });
});
app.post("/uploadnotes", auth, (req, res) => {
  const { filename, filepages } = req.body;
  res.render("upload", { filename: filename, filepages: filepages });
});
app.post("/upload/notes", auth, notes.single("notes"), async (req, res) => {
  try {
    const { fileName, filepages } = req.body;

    req.file.filePages = filepages;
    req.file.originalname = fileName;

    const {
      fieldname,
      encoding,
      originalname,
      mimetype,
      destination,
      filename,
      path,
      size,
      filePages,
    } = req.file;

    const loggedInUserId = req.cookies["user"];
    const user = await UserModal.findById(loggedInUserId);
    const date = new Date();
    const uploadedAt = `${date.getUTCDate()}/${
      date.getUTCMonth() + 1
    }/${date.getUTCFullYear()} ${date.getHours()}:${date.getMinutes()}`;

    const notes = new NotesModal({
      user: user.userName,
      fieldname,
      originalname,
      encoding,
      mimetype,
      destination,
      filename,
      path,
      size,
      uploadedAt,
      filePages,
    });

    notes.save((err, note) => {
      if (err) console.log("Something wrong while uploading your post");
      const college = req.cookies["college"];
      UserModal.find({ collegeName: college }).exec((err, res) => {
        for (let user of res) {
          user.notifications = [
            ...user.notifications,
            {
              name: note.user,
              type: "notes",
              message: `uploaded notes (${note.originalname})`,
              src: `${user.files[0].destination}/${user.files[0].originalname}`,
            },
          ];
          user.save();
        }
      });
      res.redirect("/studynotes");
    });
  } catch (err) {
    res.sendStatus(400);
  }
});
app.post("/notes/download", auth, (req, res) => {
  const { id } = req.body;

  NotesModal.findById(id, (err, note) => {
    if (err) res.redirect("/");
    note.downloads += 1;
    note.save();
  });
});
app.post("/notes/filter", auth, (req, res) => {
  const { filter } = req.body;
  switch (filter) {
    case "high to low downloads":
      NotesModal.find({})
        .sort([["downloads", -1]])
        .exec((err, docs) => {
          if (err) {
            console.log(err);
            verified("/studynotes");
          }
          res.render("study notes", { notesList: docs });
        });

      break;
    case "low to high downloads":
      NotesModal.find({})
        .sort("downloads")
        .exec((err, docs) => {
          if (err) {
            console.log(err);
            res.redirect("/studynotes");
          }
          res.render("study notes", { notesList: docs });
        });
      break;
    case "latest to old date":
      NotesModal.find({})
        .sort([["uploadedAt", -1]])
        .exec((err, docs) => {
          if (err) {
            console.log(err);
            res.redirect("/studynotes");
          }
          res.render("study notes", { notesList: docs });
        });
      break;
    case "old to latest date":
      NotesModal.find({})
        .sort("uploadedAt")
        .exec((err, docs) => {
          if (err) {
            console.log(err);
            res.redirect("/studynotes");
          }
          res.render("study notes", { notesList: docs });
        });
      break;
    case "max to min pages":
      NotesModal.find({})
        .sort([["filePages", -1]])
        .exec((err, docs) => {
          if (err) {
            console.log(err);
            res.redirect("/studynotes");
          }
          res.render("study notes", { notesList: docs });
        });
      break;
    case "min to max pages":
      NotesModal.find({})
        .sort("filePages")
        .exec((err, docs) => {
          if (err) {
            console.log(err);
            res.redirect("/studynotes");
          }
          res.render("study notes", { notesList: docs });
        });
      break;
    default:
      res.redirect("/studynotes");
  }
});
app.get("/signup", (req, res) => {
  res.render("signup");
});
app.post("/signup", users.array("userid"), async (req, res) => {
  try {
    let {
      fullname,
      email,
      phone,
      collegename,
      course,
      startyear,
      endyear,
      username,
      password,
      movie,
      food,
      confirmpassword,
    } = req.body;
    const files = req.files;

    if (password === confirmpassword) {
      const newUser = new UserModal({
        fullName: fullname,
        email,
        phone,
        collegeName: collegename.toLowerCase(),
        course,
        startYear: startyear,
        endYear: endyear,
        userName: username,
        password,
        movie,
        food,
        files,
      });

      const userRegistered = await newUser.save();

      var accessToken = await oAuth2Client.getAccessToken();
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: 'vrinmcm@gmail.com',
    clientId: CLIENT_ID,
    clientSecret: CLEINT_SECRET,
    refreshToken: REFRESH_TOKEN,
    accessToken: accessToken,
  },
});

      readHTMLFile(
        __dirname + "/views/email-template.html",
        function (err, html) {
          var template = hbs.compile(html);
          var replacements = {
            emailtoverify: email,
          };
          var htmlToSend = template(replacements);
         
         
          var mailOptions,link;
rand=Math.floor((Math.random() * 100) + 54);
host=req.get('host');
link="https://www.clgvibe.com/emailisverified?id="+rand;
var mailOptions = {
  from: 'vrinmcm@gmail.com',
  to: email,
  subject: 'Account verification (clgvibe)',
  html : "Hello,<br>Please click on the link given below to successfully complete  your clgvibe account registration .<br><a href="+link+">Click here to verify</a>" 
};

          transporter.sendMail(mailOptions, function (err) {
            if (err) {
              if (err.errno && err.errno == -3008) {
                res.render("signup", { message: "Connection Problem" });
              } else {
                res.render("signup", { message: "mail doesn't exist" });
              }
              console.log(err);
            } else {
              res.cookie("veriemail", username, {
                expires: new Date(Date.now() + 5000000*10),
              });
              res.redirect("/needtoverifyemail");
            }
          });
        }
      );
    } else {
      res.render("signup", { message: "Password does not match" });
    }
  } catch (error) {
    // console.log(error);
    // console.log("catch");
    if (error.keyPattern) {
      const existingUser = await UserModal.find({
        email: error.keyValue.email,
      });
      console.log(error);
      // if user is not verified send verification not error
      if (existingUser[0] && !existingUser[0].verified) {
        // console.log("not verified");

        const verifyemailhtml = `
          <a style="text-decoration:none; background-color: red; color:white;" href='http://${DOMAIN}${PORT}/emailisverified?email=${req.body.email}'>
            Verify Email
          </a>`;

        let senderEmail, senderPass;

        if (
          req.body.collegename.toLowerCase() ===
          "MEERUT COLLEGE MEERUT".toLowerCase()
        ) {
          senderEmail = process.env.SENDER_EMAIL_MEERUT_COLLEGE;
          senderPass = process.env.PASS_NOREPLY;
        } else {
          senderEmail = process.env.SENDER_EMAIL_NOREPLY;
          senderPass = process.env.PASS_NOREPLY;
        }

        var transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          requireTLS: true,
          auth: {
            user: senderEmail,
            pass: senderPass,
          },
        });

        const mail = {
          from: senderEmail,
          to: req.body.email,
          subject: "VFindFit Email verification",
          html: verifyemailhtml,
        };

        transporter.sendMail(mail, function (err) {
          if (err) {
            if (err.errno && err.errno == -3008) {
              //connection error
              res.render("signup", { message: "Connection Problem" });
            } else {
              console.log(err);
              res.render("signup", { message: "Something Wrong Try again" });
            }
            // console.log(err);
          } else {
            res.redirect("/needtoverifyemail");
          }
        });
      } else {
        // if user is verified then can't use previous email phone username
        console.log("key pattern error");
        if (error.keyPattern && error.keyPattern.email >= 1) {
          res.send(
            `${error.keyValue.email} id already exist try with different email <a href='/signup'>Sign Up again</a>`
          );
        } else if (error.keyPattern && error.keyPattern.phone >= 1) {
          res.send(
            `${error.keyValue.phone} number already exist try with different phone number <a href='/signup'>Sign Up again</a>`
          );
        } else if (error.keyPattern && error.keyPattern.userName >= 1) {
          res.send(
            `${error.keyValue.username} already exist try with different username <a href='/signup'>Sign Up again</a>`
          );
        }
      }
    } else {
      console.log(error);
      res.send("new error except key pattern");
    }
  }
});
app.get("/needtoverifyemail", (req, res) => {
  res.render("verify email");
});
app.get("/needtoverifypass", (req, res) => {
  res.render("verify pass");
});
app.get("/emailisverified", (req, res) => {
  console.log(req.protocol+"://www.clgvibe.com");
  if((req.protocol+"://"+req.get('host'))==("http://"+host))
  {
      console.log("Domain is matched. Information is from Authentic email");
      if(req.query.id==rand && req.cookies["veriemail"] && req.cookies["veriemail"] !== "")
      {
        UserModal.findOneAndUpdate(
          { userName: req.cookies["veriemail"] },
          { $set: { verified: true } }
        )
          .then(() => {
            res.redirect("/login");
          })
          .catch((err) => {
            console.log(err);
            res.redirect("/signup");
          });
        rand=918273645;
        res.redirect("/login");
      }
      else
      {
          console.log("email is not verified");
          res.end("<h1>Welcome to the famliy </h1> <p>Currently your acoount is under process and you will will notfied on the registered mail-id once all set for you  :) </p>");
      }
  }
  else
  {
      res.end("<h1>Welcome to the family, your account is under process and you will be notified once completed on the registered email. </h1>");
  }
  
});
app.get("/login", (req, res, next) => {
    const user = req.cookies["user"];
    if (user) res.redirect("/");
    else next();
  },
  (req, res) => {
    res.render("login");
  }
);
app.get("/home", (req, res, next) => {
    const user = req.cookies["user"];
    if (user) res.redirect("/");
    else next();
  },
  (req, res) => {
    res.render("home");
  }
);
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = await UserModal.find({ userName: username });
    const user = users[0];

    if (user) {
      // user exist or not
      if (user.verified) {
        // user email is verified
        const userid = user.id;
        const isPasswordCorrect = await bcryptjs.compare(
          password,
          user.password
        );

        if (isPasswordCorrect) {
          // if password is correct
          res.cookie("user", userid);
          res.cookie("college", user.collegeName);
          res.redirect("/");
        } else {
          // if password is incorrect
          res.render("login", { message: `Password is Incorrect` });
        }
      } else {
        // if email is not verified
        res.render("login", {
          message:
            "Your email is not verified Go to email and click on given link to verify",
        });
      }
    } else {
      // if username does not exits in db
      res.render("login", { message: `${username} does not exist` });
    }
  } catch (error) {
    console.log(error);
    res.end("error");
  }
});
app.get("/logout", auth, (req, res) => {
  res.cookie("college", "", { expires: new Date(Date.now()) });
  res.cookie("user", "", { expires: new Date(Date.now()) });
  res.redirect("/login");
});
app.get("/posttext", auth, (req, res) => {
  res.render("post text");
});
app.get("/postimage", auth, (req, res) => {
  res.render("post image");
});

app.get("/postvideo", auth, (req, res) => {
  res.render("post video");
});
app.post("/postfit", auth, fits.single("fitpic"), async (req, res) => {
  const fitFile = req.file;
  const { message } = req.body;

  const userid = req.cookies["user"];
  const college = req.cookies["college"];

  const user = await UserModal.find({ _id: userid });
  const username = user[0].userName;
  console.log(username);
  const { destination, filename } = user[0].files[0];

  const fit = new FitModal({
    file: fitFile,
    message,
    userid,
    username,
    userphoto: {
      destination,
      filename,
    },
    college,
  });

  const savedFit = await fit.save();

  res.redirect("/");
});
app.get("/deletefit", auth, async (req, res) => {
  try {
    const fitid = req.query.id;
    const fits = await FitModal.deleteOne({ _id:fitid });
    res.redirect(`/profile`);
  } catch (error) {}
});
// var rand=Math.floor((Math.random() * 100) + 54);
var hostpass,randpass;
app.get("/forgotpassword", (req, res) => {
  res.render("forgotpassword");
});
app.get("/resetbyemail", (req, res) => {
  res.render("resetbyemail");
});
app.post("/resetbyemail", async (req,res) => {
  try{
    const { username } = req.body;
  const user = await UserModal.find({ userName: username });
  if (user && user[0]) {
usernme=username;
var accessToken = await oAuth2Client.getAccessToken();
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: 'vrinmcm@gmail.com',
    clientId: CLIENT_ID,
    clientSecret: CLEINT_SECRET,
    refreshToken: REFRESH_TOKEN,
    accessToken: accessToken,
  },
});
var mailOptions,link;
randpass=Math.floor((Math.random() * 100) + 54);
hostpass=req.get('host');
link="https://www.clgvibe.com/verify?id="+randpass;
var mailOptions = {
  from: 'vrinmcm@gmail.com',
  to: user[0].email,
  subject: 'Password Reset (clgvibe)',
  html : "Hello,<br>Please click on the link given below to change your account password .<br><a href="+link+">Click here to verify</a>" 
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    res.redirect("/needtoverifypass"); 
    console.log('Email sent: ' + info.response);
  }
});
} else {
  res.render("resetbyemail", { message: "This username does not exist" });
      }
    }
    catch(err){
      console.log(err);
    }
});
app.post("/forgotpassword", async (req, res) => {
  const { username, food, movie } = req.body;
  console.log(username);
  const user = await UserModal.find({ userName: username });
  if (user && user[0]) {
    if (user[0].food === food && user[0].movie === movie) {
      res.cookie("resetpass", username, {
        expires: new Date(Date.now() + 5000000*10),
      });
      res.redirect("resetpassword");
    
    }
    else{
      res.render("forgotpassword", { message: "credentials not matched" });
    }
  }
    else {
      res.render("forgotpassword", { message: "This username does not exist" });
          }
});
app.get('/verify',function(req,res){
  console.log(req.protocol+"://www.clgvibe.com");
  if((req.protocol+"://"+req.get('host'))==("http://"+hostpass))
  {
      console.log("Domain is matched. Information is from Authentic email");
      if(req.query.id==randpass)
      {
        res.cookie("resetpass", usernme, {
          expires: new Date(Date.now() + 50000*10),
        });
        randpass=918273645;
        res.redirect("resetpassword");
      }
      else
      {
          console.log("email is not verified");
          res.end("<h1>Link has expired </h1>");
      }
  }
  else
  {
      res.end("<h1>Link has expired </h1>");
  }}
  );
app.get( "/resetpassword",(req, res, next) => {
    if (req.cookies["resetpass"] && req.cookies["resetpass"] !== "") {
      next();
    } else {
      res.redirect("login");
    }
  },
  (req, res) => {
    res.render("resetpassword");
  }
);
app.post( "/resetpassword", (req, res, next) => {
    if (req.cookies["resetpass"] && req.cookies["resetpass"] !== "") {
      next();
    } else {
      res.redirect("login");
    }
  },
  async (req, res) => {
    const { password, cpass } = req.body;
    if (password && password === cpass && password !== "") {
      const username = req.cookies["resetpass"];
      const hashPassword = await bcryptjs.hash(password, 10);
      const user = await UserModal.update(
        { userName: username },
        {
          password: hashPassword,
        }
      );
      console.log(user);
      res.redirect("login");
    } else {
      res.render("resetpassword", { message: "Password does not match" });
    }
  }
);
app.get("/chat", auth, async (req, res) => {
  if (req.query && req.query.username) {
    const users=await UserModal.findById(req.cookies["user"]);
    const user = await UserModal.findById(req.query.username);
    res.render("chat", { user: user, users: users });
  } else {
    res.redirect("/");
  }
});
app.get("/chats", auth, async (req, res) => {
  if (req.query && req.query.username) {
    const users=await UserModal.findById(req.cookies["user"]);
    const user = await UserModal.findById(req.query.username);
    res.render("chats", { user: user, users: users });
  } else {
    res.redirect("/");
  }
});
app.get("/recentuser", auth, async (req, res) => {
  try {
    const loggedInUserId = req.cookies["user"];
    const user = await UserModal.findById(loggedInUserId);
    const username = user.userName;
      // const chatRoomMember = req.query.useame;
      const chats = await ChatModal.find({
        $or: [
          { sender: username},
          { receiver: username },
        ],
      });
      var chatuser=[];
      for (let index = chats.length - 1; index >= 0; index--) {
              myFunction(index,chats);
      }
     
      function myFunction( index, arr) {
        if(!arr[index].sender.localeCompare(username)){
          if(!chatuser.includes(arr[index].receiver)){
          chatuser.push(arr[index].receiver);}
        }
        if(!arr[index].receiver.localeCompare(username)){
          
          if(!chatuser.includes(arr[index].sender)){
          chatuser.push(arr[index].sender);}
        }
      }
    
     // console.log(chatuser);
     if(chatuser[0]!=undefined){
       let recent= await UserModal.find({userName: chatuser[0]});
       let recentuser= recent[0]._id;
     res.redirect(`chats?username=${recentuser}`);
     }
     else{
       res.redirect(`newuser`);
     }
  } catch (error) {
    console.log("catch error " + error);
  }
});
app.get("/getchatuser", auth, async (req, res) => {
  try {
    const loggedInUserId = req.cookies["user"];
    const user = await UserModal.findById(loggedInUserId);
    const username = user.userName;
      // const chatRoomMember = req.query.useame;
      const chats = await ChatModal.find({
        $or: [
          { sender: username},
          { receiver: username },
        ],
      });
      var chatuser=[];
      for (let index = chats.length - 1; index >= 0; index--) {
              myFunction(index,chats);
      }
     
      function myFunction( index, arr) {
        if(!arr[index].sender.localeCompare(username)){
          if(!chatuser.includes(arr[index].receiver)){
          chatuser.push(arr[index].receiver);}
        }
        if(!arr[index].receiver.localeCompare(username)){
          
          if(!chatuser.includes(arr[index].sender)){
          chatuser.push(arr[index].sender);}
        }
      }
    
     // console.log(chatuser);
      res.send(chatuser);
  } catch (error) {
    console.log("catch error " + error);
  }
});
app.get("/chatuserimg", auth, async (req, res) => {
  try {
    var user;
      if( req.query.name){
      var name=req.query.name;
        var user = await UserModal.find({ userName: name });
      var userstatus = user[0];
      }
    // console.log(userstatus);
      res.send(userstatus);
   
  } catch (error) {
    console.log("catch error " + error);
  }
});
app.get("/chatcount", auth, async (req, res) => {
  try {
    const loggedInUserId = req.cookies["user"];
    const user = await UserModal.findById(loggedInUserId);
    const username = user.userName;
    if (req.query && req.query.name) {
      // console.log("username");
      const chatRoomMember = req.query.name;
      const chats = await ChatModal.find({
        $or: [
          { sender: chatRoomMember, receiver: username },
          { sender: username, receiver: chatRoomMember },
        ],
      });
      var chatno=[];
      for (let index = chats.length - 1; index >= 0; index--) {
              if(chats[index].sender == username){
                break;
              }
              chatno.push(chats[index]);
      }
     
  
     //console.log(chats);
      res.send(chatno);
    } else {
      console.log("else");
      res.redirect("/");
    }
  } catch (error) {
    console.log("catch error " + error);
  }
});
app.get("/getchat", auth, async (req, res) => {
  try {
    const loggedInUserId = req.cookies["user"];
    const user = await UserModal.findById(loggedInUserId);
    const username = user.userName;
    if (req.query && req.query.username) {
      // console.log("username");
      const chatRoomMember = req.query.username;
      const chats = await ChatModal.find({
        $or: [
          { sender: username, receiver: chatRoomMember },
          { sender: chatRoomMember, receiver: username },
        ],
      });
     //console.log(chats);
      res.send(chats);
    } else {
      console.log("else");
      res.redirect("/");
    }
  } catch (error) {
    console.log("catch error " + error);
  }
});
app.get("/deletechat", auth , async(req,res)=>{
  if (req.query && req.query.receiver && req.query.username) {
  const username = req.query.username; 
  //console.log(req.query.receiver);
  const deleteChat = await ChatModal.deleteOne({
      _id: req.query.receiver,
    });
      //console.log(userStatus);
      res.redirect(`chat?username=${username}`);
    } else if(req.query && req.query.username){
      const sender=req.cookies["user"];
      const users=await UserModal.findById(sender);
      const username = users.userName; 
      const deleteChat = await ChatModal.deleteMany({
          $or: [
            { sender: username },
          ],
        });
          res.redirect(`chat?username=${req.query.username}`);
    }
    else{
      res.render("/")
    }
    //res.render("/chat?username="+receiver)
});
app.post("/chat", auth, async (req) => {
  try {
    const { sender, message, receiver, gif } = req.body;
    const user = await UserModal.findById(sender);
    const username = user.userName;
    // const deleteChat = await ChatModal.deleteMany({
    //   $or: [
    //     { sender: username, receiver: receiver },
    //     { sender: receiver, receiver: username },
    //   ],
    // });
    const chat = new ChatModal({
      sender: username,
      message,
      receiver,
      gif,
    });
    const saveChat = await chat.save();
  } catch (error) {
    console.log("catch error");
    console.log(error);
  }
});
app.post("/chatimg", auth, chats.single("chatimage"), async (req, res) => {
  const { sender, receiver } = req.body;
  const chatimage = req.file;
  const user = await UserModal.find({userName: receiver});
  const username = user[0]._id;
  let message = "",
    gif = "";
    const chat = new ChatModal({
      sender,
      message,
      receiver,
      gif,
      image: chatimage,
    });
    const saveChat = await chat.save();
  res.redirect(`chat?username=${username}`);
});
app.post("/likedislike", auth, async (req) => {
  const { postId, action } = req.body;
  const userId = req.cookies["user"];
  const user = await UserModal.findById(userId);
  if (action === "like") {
    FitModal.findById(postId, (err, fit) => {
      fit.likes = [...fit.likes, user.userName];
      fit.likescount = fit.likes.length;
      fit.save((err, fit) => {
        // save who liked the post
        if (fit) {
          UserModal.findById(fit.userid, (err, user) => {
            // find the fit owner
            if (user) {
              UserModal.findById(req.cookies["user"], (err, whoLiked) => {
                /// find who liked the fit
                if (whoLiked) {
                  user.notifications = [
                    ...user.notifications,
                    {
                      name: whoLiked.userName,
                      type: "like",
                      message: "Liked your Vibe",
                      src: `${whoLiked.files[0].destination}/${whoLiked.files[0].originalname}`,
                    },
                  ];
                  user.save();
                }
              });
            }
          });
        }
      });
    });
  } else {
    FitModal.findById(postId, (err, fit) => {
      fit.likes.splice(fit.likes.indexOf(user.userName), 1);
      fit.likescount = fit.likes.length;
      fit.save();
    });
  }
});
app.post("/fitcomment", auth, async (req) => {
  const { comment, postId } = req.body;
  const userId = req.cookies["user"];
  const user = await UserModal.findById(userId);
  FitModal.findById(postId, (err, fit) => {
    fit.comments = [...fit.comments, { username: user.userName, comment }];
    fit.commentsCount = fit.comments.length;
    fit.save((err, fit) => {
      if (fit) {
        UserModal.findById(fit.userid, (err, user) => {
          // find the fit owner
          if (user) {
            UserModal.findById(req.cookies["user"], (err, whoComment) => {
              /// find who liked the fit
              if (whoComment) {
                user.notifications = [
                  ...user.notifications,
                  {
                    name: whoComment.userName,
                    type: "comment",
                    message: "Commented on your vibe",
                    src: `${whoComment.files[0].destination}/${whoComment.files[0].originalname}`,
                  },
                ];
                user.save();
              }
            });
          }
        });
      }
    });
  });
});
app.get("/getcurrentuser", auth, (req, res) => {
  UserModal.findById(req.cookies["user"], (err, currentUser) => {
    res.send(currentUser);
  });
});
app.get("/jumptoothercolleges", auth, (req, res) => {
  mongoose.connection.db.collection("colleges", async () => {
    try {
      let college,image;
      if(req.cookies['image']){
        image = req.cookies["image"];}
      else{
      
        const user = req.cookies["user"];
      let users= await UserModal.findById(user);
      colleges.forEach(myFunction);
       
      function myFunction(item, index, arr) {
        if(!arr[index].college.localeCompare(users.collegeName)){
          image=arr[index].image;
          college= arr[index].college;
        }
      }
    
      }
      if(req.cookies['college']){
        college = req.cookies["college"];}
      // res.render("clg", { colleges, college, image });
      res.render("clg", { colleges, college, image });
    } catch (error) {
      console.log("catch error in jumtocolleges " + error);
    }
  });
});
app.get("/findfriends", auth, async (req, res) => {
  try {
    const userid = req.cookies["user"];
    const clg = req.cookies["college"];
    
    if(req.cookies['image']){
      image = req.cookies["image"];}
    else{
    
      const user = req.cookies["user"];
    let users= await UserModal.findById(user);
    colleges.forEach(myFunction);
     
    function myFunction(item, index, arr) {
      if(!arr[index].college.localeCompare(users.collegeName)){
        image=arr[index].image;
      }
    }
  
    }

    const college = clg.toLowerCase();
    // console.log(college);
    const loggedInUser = await UserModal.findById(userid);
     console.log(loggedInUser._id);

    const users = await UserModal.find({
      collegeName: college,
      _id: { $nin: loggedInUser._id },
      blockedby: { $nin: loggedInUser._id },
      verified: true,
    });
    // console.log(users);

    res.render("friends", { users, college, image });
  } catch (error) {
    console.log("catch error");
  }
});
app.get("/friendsprofile", async (req, res) => {
  try {
    if (req.query && req.query.username) {
      var newUsers=[];
      const username = req.query.username;
      const users = await UserModal.find({ userName: username });
      const user = users[0];
      const fits = await FitModal.find({ userid: user._id });
      const fitLength = fits.length;
      var tomatoid=null;
      if(req.cookies["college"]){
      const collegeName = req.cookies["college"];
      const nUsers = await UserModal.find({ collegeName }).limit(10);
      if(req.cookies["user"]){
         tomatoid=req.cookies["user"];
      nUsers.forEach(myfunction2);
      function myfunction2(item,index,arr){
        if(arr[index]._id!=user._id && arr[index]._id!=tomatoid)
        { newUsers.push(arr[index]);
        }
      }
      }
      else{
        nUsers.forEach(myfunction2);
        function myfunction2(item,index,arr){
          if(arr[index]._id!=user._id)
          { newUsers.push(arr[index]);
          }
        }
      }
    }
      res.render("friendsprofile", { user, fits, fitLength, newUsers, tomatoid });

    } else {
      res.redirect("/findfriends");
    }
  } catch (error) {
    console.log("catch errr " + error);
  }
});
app.get("/profile", auth, async (req, res) => {
  try {
    const userid = req.cookies["user"];
    const user = await UserModal.findById(userid);
    const fits = await FitModal.find({ userid });
    res.render("profile", { user, fits, fitLength: fits.length });
  } catch (error) {}
});
app.get("/allposts", auth, async (req, res) => {
  if (req.query && req.query.username) {
    const loggedinusername = req.query.username;
    const users = await UserModal.find({ userName: loggedinusername });
    const user = users[0];
    const fits = await FitModal.find({ userid: user._id });
    res.send(fits);
  } else {
    const loggedinuserid = req.cookies["user"];
    const fits = await FitModal.find({ userid: loggedinuserid });
    res.send(fits);
  }
});
app.get("/newuser",auth, async (req,res) => {
  try {
    const userid = req.cookies["user"];
    const loggedInUser = await UserModal.findById(userid);
    // console.log(loggedInUser.collegeName);
    const users = await UserModal.find({
      _id: { $nin: loggedInUser._id },
      blockedby: { $nin: loggedInUser.blocks },
      verified: true,
    });
    // console.log(users);

    res.render("newusers", { users });
  } catch (error) {
    console.log("catch error");
  }
});
app.get("/editprofile", auth, async (req, res) => {
  try {
    const userid = req.cookies["user"];
    const user = await UserModal.findById(userid);
    res.render("editprofile", { user });
  } catch (error) {}
});
app.post("/editprofile", auth, users.single("userid"), async (req, res) => {
 try{
    const {
    fullName,
    course,
    userName,
  } = req.body;
  const userid = req.file;
  const usrid = req.cookies["user"];
  const usr= await UserModal.findById(usrid);
    const chat = await ChatModal.updateMany(
      { sender: usr.userName },
      {
        sender: userName,
      }
    );
    const chat1 = await ChatModal.updateMany(
      { receiver: usr.userName },
      {
        receiver: userName,
      }
    );
  if(userid!=undefined){
  UserModal.findById(usrid, (err, user) => {
    (user.files = userid),
      (user.fullName = fullName),
      (user.course = course),
      (user.userName = userName);
    user.save();
  });
}
else{
  UserModal.findById(usrid, (err, user) => {
      (user.fullName = fullName),
      (user.course = course),
      (user.userName = userName);
    user.save();
  });
}
  res.redirect("/profile");
}
catch(err){
  console.log(err);
}
});
app.get("/blockperson", auth, (req, res) => {
  var blockid  = req.query.id;
 // console.log(blockid);
  const loggedinuser = req.cookies["user"];
  UserModal.findById(loggedinuser, (err, user) => {
    user.blocks = [...user.blocks, blockid];
    user.save();
  });
  UserModal.findById(blockid, (err, user) => {
    user.blockedby = [...user.blockedby, loggedinuser];
    user.save();
  });
  res.redirect("/findfriends");
});
app.get("/unblockperson", auth, (req, res) => {
  const { unblockid } = req.query;
  const loggedinuser = req.cookies["user"];
  UserModal.findById(loggedinuser, (err, user) => {
    user.blocks = user.blocks.filter((blockid) => {
      if (blockid !== unblockid) return blockid;
    });
    user.save();
  });
  UserModal.findById(unblockid, (err, user) => {
    user.blockedby = user.blockedby.filter((blockedbyid) => {
      if (blockedbyid !== unblockid) {
      } else {
        return blockedbyid;
      }
    });
    user.save();
  });
  res.redirect("/findfriends");
});
app.get("/getnewchat", auth, (req, res) => {
  const loggedInUserId = req.cookies["user"];
  UserModal.findById(loggedInUserId, (err, user) => {
    if (user) {
      ChatModal.find({ receiver: user.userName }, (err, chat) => {
        res.send(chat);
      });
    }
  });
});
app.get("/notifications", auth, async (req, res) => {
  const user = await UserModal.findById(req.cookies["user"]);
  res.render("notifications", { user });
});
app.get("/getnotifications", auth, async (req, res) => {
  const user = await UserModal.findById(req.cookies["user"]);
  res.send(user.notifications);
});
app.get("/getnotifylength", auth, async (req, res) => {
  const user = await UserModal.findById(req.cookies["user"]);
  res.send({ length: user.notifications.length });
});
app.get("/notificationread", auth, (req) => {
  UserModal.findById(req.cookies["user"], (err, user) => {
    user.notifications = [];
    user.save();
  });
});
// chaudhary charan singh university 
// meerut college meerut 
// d. n. degree college meerut
// raghunath girl’s post graduate college
// n a s college meerut
// miet college 
// swami vivekanand subharti university
// iimt university
