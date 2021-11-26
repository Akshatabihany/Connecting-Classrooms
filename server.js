const express = require("express");
const app = express();
const bodyParser=require("body-parser");
const { stringify } = require("querystring");

var mongoose = require('mongoose');
const { on } = require("events");
const { off } = require("process");
var Schema = mongoose.Schema;
// socket io requirements starts
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
// socket io requirements ends


let ejs = require('ejs');
var path = require("path");

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
mongoose.connect("mongodb+srv://akshata:akshata@cluster0.skscj.mongodb.net/SchedulerDB",{useNewUrlParser: true},{useUnifiedTopology:true})


userSchema = new Schema( {
	unique_id: Number,
	mailID: String,
	name: String,
    reg_no:String,
	password: String,
	role:String
})
User = mongoose.model('User', userSchema);

ClassSchema =new Schema({
	ClassName:String,
	ClassID:Number,
	ClassCode: String,
	TeacherID:String, //this is basically teacher's reg_no
	Schedule:[{dayIndex : String , startTime : Number , endTime : Number }],
	Newsletter: [{Notice : String , noticeDate : String}]
})

Class = mongoose.model('Class', ClassSchema);

StudentClassRegSchema = new Schema({
	ClassCode:String,
	StudentID:String,
	attendAsOnline:Boolean,
	StartDate:Date,
	EndDate:Date
})

StudentClassReg = mongoose.model('StudentClassReg', StudentClassRegSchema);

ToggleClassModeSchema = new Schema({
	ClassCode:String,
	StudentID:String,
	StartDate:Date,
	EndDate:Date,
	Description:String
})

ToggleClassMode = mongoose.model('ToggleClassMode',ToggleClassModeSchema);

TeacherChatSchema = new Schema( {
	msg:String,
    TeacherID: String,
    Time:Date,
    Room:String
})
TeacherChat = mongoose.model('TeacherChat', TeacherChatSchema);

chatSchema = new Schema( {
	msg:String,
    sender:String,
    Time:Date,
    Room:String,
	isTeacher:Number
})
Chat = mongoose.model('Chat', chatSchema);



app.get("/", (req, res) => {
    res.sendFile(__dirname+"/LandingPage.html");
});
app.get("/Register", (req, res) => {
    res.sendFile(__dirname+"/Register.html");
});

app.post("/User_Register",(req,res)=>{
//	console.log(req.body);
	var personInfo = req.body;
	if(!personInfo.mailID || !personInfo.name || !personInfo.password || !personInfo.passwordConf ||!personInfo.Reg_no){
		res.send({"Fail":"Please fill all details"});
	} else {
		var x = personInfo.Reg_no;
        if(x.substring(0, 1)!='S' && x.substring(0, 1)!='T')
		{
			res.render("Register",{"Error":"Invalid Registration Number"});
			return;
		}
        var Role ;
        if(x.substring(0, 1)=='S')
        {
            Role="Student";
        }
        else{
            Role="Teacher";
        }
		if (personInfo.password == personInfo.passwordConf) {

			User.findOne({mailID:personInfo.mailID},function(err,data){
				if(!data){
					var c;
					User.findOne({},function(err,data){

						if (data) {
							//console.log("if");
							c = data.unique_id + 1;
						}else{
							c=1;
						}
						var newPerson = new User({
							unique_id:c,
							mailID:personInfo.mailID,
							name: personInfo.name,
                            reg_no:personInfo.Reg_no,
							password: personInfo.password,
                            role:Role
						});
                      
						newPerson.save(function(err, Person){
							if(err)
								console.log(err);
							
						});

					}).sort({_id: -1}).limit(1);
                    res.render("Login",{"Error":"You are registered,You can login now."})
					//res.send({"Success":"You are registered,You can login now."});
				}else{
                    res.render("Register",{"Error":"Email is already used.Register with different mailId"})
					//res.send({"Success":"Email is already used."});
				}
			});
		}else{
            res.render("Register",{"Error":"password is not matched, try again"})
			//res.send({"Success":"password is not matched"});
		}
	}
//res.render('Student_Dashboard')
})

// Login
app.get("/Login", (req, res) => {
    res.sendFile(__dirname+"/Login.html");
});

app.post("/User_Login",(req,res)=>{
    User.findOne({mailID:req.body.mailID},async function(err,data){
		if(data){
			if(data.password==req.body.password){
                  var id_start=data.reg_no;
                  if(id_start.substring(0, 1)=="S")
				  {
					  var classids=[];
					  let StudentClassRegInfos=await StudentClassReg.find({StudentID:id_start});//
					  console.log(StudentClassRegInfos)
					 // res.render("success",{"info":"checking"})

					  for(let StudentClassRegInfo of StudentClassRegInfos)
                      {                
                        classids.push(StudentClassRegInfo.ClassCode);
                      }
					  //console.log(classids)
					  var Stud_classNames=[]
					  var Schedule_temp=[];
					  
					  var Monday=[];
					  var Tuesday=[];
					  var Wednesday=[];
					  var Thursday=[];
					  var Friday=[];
					  var Saturday=[];
					  var Newsletter_List=[]
					  //it should be classcode not classids here below.
					  for(let cid =0;cid<classids.length;cid++)
					  {
						var Schedule_temp;
						let Classinfos=await Promise.resolve(Class.find({ClassCode:classids[cid]}));
						let attendAs=await Promise.resolve(StudentClassReg.find({ClassCode:classids[cid],StudentID:id_start}));
						var att=attendAs[0].attendAsOnline;
						var currdate=new Date();
						Stud_classNames.push(Classinfos[0].ClassName);
						Newsletter_List.push(Classinfos[0].Newsletter);
						//Newsletter_ListTime.push(Classinfos[0].Newsletter.noticeDate);
						
						if(attendAs[0].StartDate && attendAs[0].EndDate && currdate>attendAs[0].StartDate&&currdate<attendAs[0].EndDate)
						{
						 att=!att;	
						}
					//	console.log(att);
						Schedule_temp=Classinfos[0].Schedule;
						var classname=Classinfos[0].ClassName;
						var bool_val=att;
						for(let i=0;i<Schedule_temp.length;i++)
						{
							if(Schedule_temp[i].dayIndex=="Monday")
							{
								var y= new Array(classname,Schedule_temp[i].startTime,Schedule_temp[i].endTime,bool_val)
								Monday.push(y);
							}
							else if(Schedule_temp[i].dayIndex=="Tuesday")
							{
								var y= new Array(classname,Schedule_temp[i].startTime,Schedule_temp[i].endTime,bool_val)
							    Tuesday.push(y);
							}
							else if(Schedule_temp[i].dayIndex=="Wednesday")
							{
								var y= new Array(classname,Schedule_temp[i].startTime,Schedule_temp[i].endTime,bool_val)
								Wednesday.push(y);
							}
							else if(Schedule_temp[i].dayIndex=="Thursday")
							{
								var y= new Array(classname,Schedule_temp[i].startTime,Schedule_temp[i].endTime,bool_val)
								Thursday.push(y);
							}
							else if(Schedule_temp[i].dayIndex=="Friday")
							{
								var y= new Array(classname,Schedule_temp[i].startTime,Schedule_temp[i].endTime,bool_val)
								Friday.push(y);
							}
							else if(Schedule_temp[i].dayIndex=="Saturday")
							{
								var y= new Array(classname,Schedule_temp[i].startTime,Schedule_temp[i].endTime,bool_val)
								Saturday.push(y);
							}
						}
					  }
					  var timetable = []
					  var online=[]
					  for(let i=0;i<6;i++)
					  {
						var inner_arr=[]
						var online_inner=[]
                        for(let j=0;j<6;j++)
						{
                            inner_arr.push("Free");
							online_inner.push("Offline")
						}
						online.push(online_inner)
						timetable.push(inner_arr)
					  }
					//   Monday
					   for(let i=0;i<Monday.length;i++)
					   {
						   if(Monday[i][1]=='9' && Monday[i][2]=='10')
						   {
                                 timetable[0][0]=Monday[i][0];
								 if(Monday[i][3])
								 online[0][0]="Online"
						   }
						   else if(Monday[i][1]=='10' && Monday[i][2]=='11')
						   {
                                 timetable[0][1]=Monday[i][0];
								 if(Monday[i][3])
								 online[0][1]="Online"
						   }
						   else if(Monday[i][1]=='11' && Monday[i][2]=='12')
						   {
                                 timetable[0][2]=Monday[i][0];
								 if(Monday[i][3])
								 online[0][2]="Online"
						   }
						   else if(Monday[i][1]=='12' && Monday[i][2]=='13')
						   {
                                 timetable[0][3]=Monday[i][0];
								 if(Monday[i][3])
								 online[0][3]="Online"
						   }
						   else if(Monday[i][1]=='13' && Monday[i][2]=='14')
						   {
                                 timetable[0][4]=Monday[i][0];
								 if(Monday[i][3])
								 online[0][4]="Online"
						   }
						   else if(Monday[i][1]=='14' && Monday[i][2]=='15')
						   {
                                 timetable[0][5]=Monday[i][0];
								 if(Monday[i][3])
								 online[0][5]="Online"
						   }
					   }

					   //   Tuseday
					   for(let i=0;i<Tuesday.length;i++)
					   {
						   if(Tuesday[i][1]=='9' && Tuesday[i][2]=='10')
						   {
                                 timetable[1][0]=Tuesday[i][0];
								 if(Tuesday[i][3])
								 online[1][0]="Online"
						   }
						   else if(Tuesday[i][1]=='10' && Tuesday[i][2]=='11')
						   {
                                 timetable[1][1]=Tuesday[i][0];
								 if(Tuesday[i][3])
								 online[1][1]="Online"
						   }
						   else if(Tuesday[i][1]=='11' && Tuesday[i][2]=='12')
						   {
                                 timetable[1][2]=Tuesday[i][0];
								 if(Tuesday[i][3])
								 online[1][2]="Online"
						   }
						   else if(Tuesday[i][1]=='12' && Tuesday[i][2]=='13')
						   {
                                 timetable[1][3]=Tuesday[i][0];
								 if(Tuesday[i][3])
								 online[1][3]="Online"
						   }
						   else if(Tuesday[i][1]=='13' && Tuesday[i][2]=='14')
						   {
                                 timetable[1][4]=Tuesday[i][0];
								 if(Tuesday[i][3])
								 online[1][4]="Online"
						   }
						   else if(Tuesday[i][1]=='14' && Tuesday[i][2]=='15')
						   {
                                 timetable[1][5]=Tuesday[i][0];
								 if(Tuesday[i][3])
								 online[1][5]="Online"
						   }
					   }

					   //   Wednesday
					   for(let i=0;i<Wednesday.length;i++)
					   {
						   if(Wednesday[i][1]=='9' && Wednesday[i][2]=='10')
						   {
                                 timetable[2][0]=Wednesday[i][0];
								 if(Wednesday[i][3])
								 online[2][0]="Online"
						   }
						   else if(Wednesday[i][1]=='10' && Wednesday[i][2]=='11')
						   {
                                 timetable[2][1]=Wednesday[i][0];
								 if(Wednesday[i][3])
								 online[2][1]="Online"
						   }
						   else if(Wednesday[i][1]=='11' && Wednesday[i][2]=='12')
						   {
                                 timetable[2][2]=Wednesday[i][0];
								 if(Wednesday[i][3])
								 online[2][2]="Online"
						   }
						   else if(Wednesday[i][1]=='12' && Wednesday[i][2]=='13')
						   {
                                 timetable[2][3]=Wednesday[i][0];
								 if(Wednesday[i][3])
								 online[2][3]="Online"
						   }
						   else if(Wednesday[i][1]=='13' && Wednesday[i][2]=='14')
						   {
                                 timetable[2][4]=Wednesday[i][0];
								 if(Wednesday[i][3])
								 online[2][4]="Online"
						   }
						   else if(Wednesday[i][1]=='14' && Wednesday[i][2]=='15')
						   {
                                 timetable[2][5]=Wednesday[i][0];
								 if(Wednesday[i][3])
								 online[2][5]="Online"
						   }
					   }

					   //   Thursday
					   for(let i=0;i<Thursday.length;i++)
					   {
						   if(Thursday[i][1]=='9' && Thursday[i][2]=='10')
						   {
                                 timetable[3][0]=Thursday[i][0];
								 if(Thursday[i][3])
								 online[3][0]="Online"
						   }
						   else if(Thursday[i][1]=='10' && Thursday[i][2]=='11')
						   {
                                 timetable[3][1]=Thursday[i][0];
								 if(Thursday[i][3])
								 online[3][1]="Online"
						   }
						   else if(Thursday[i][1]=='11' && Thursday[i][2]=='12')
						   {
                                 timetable[3][2]=Thursday[i][0];
								 if(Thursday[i][3])
								 online[3][2]="Online"
						   }
						   else if(Thursday[i][1]=='12' && Thursday[i][2]=='13')
						   {
                                 timetable[3][3]=Thursday[i][0];
								 if(Thursday[i][3])
								 online[3][3]="Online"
						   }
						   else if(Thursday[i][1]=='13' && Thursday[i][2]=='14')
						   {
                                 timetable[3][4]=Thursday[i][0];
								 if(Thursday[i][3])
								 online[3][4]="Online"
						   }
						   else if(Thursday[i][1]=='14' && Thursday[i][2]=='15')
						   {
                                 timetable[3][5]=Thursday[i][0];
								 if(Thursday[i][3])
								 online[3][5]="Online"
						   }
					   }

					   //   Friday
					   for(let i=0;i<Friday.length;i++)
					   {
						   if(Friday[i][1]=='9' && Friday[i][2]=='10')
						   {
                                 timetable[4][0]=Friday[i][0];
								 if(Friday[i][3])
								 online[4][0]="Online"
						   }
						   else if(Friday[i][1]=='10' && Friday[i][2]=='11')
						   {
                                 timetable[4][1]=Friday[i][0];
								 if(Friday[i][3])
								 online[4][1]="Online"
						   }
						   else if(Friday[i][1]=='11' && Friday[i][2]=='12')
						   {
                                 timetable[4][2]=Friday[i][0];
								 if(Friday[i][3])
								 online[4][2]="Online"
						   }
						   else if(Friday[i][1]=='12' && Friday[i][2]=='13')
						   {
                                 timetable[4][3]=Friday[i][0];
								 if(Friday[i][3])
								 online[4][3]="Online"
						   }
						   else if(Friday[i][1]=='13' && Friday[i][2]=='14')
						   {
                                 timetable[4][4]=Friday[i][0];
								 if(Friday[i][3])
								 online[4][4]="Online"
						   }
						   else if(Friday[i][1]=='14' && Friday[i][2]=='15')
						   {
                                 timetable[4][5]=Friday[i][0];
								 if(Friday[i][3])
								 online[4][5]="Online"
						   }
					   }

					   //   Saturday
					   for(let i=0;i<Saturday.length;i++)
					   {
						   if(Saturday[i][1]=='9' && Saturday[i][2]=='10')
						   {
                                 timetable[5][0]=Saturday[i][0];
								 if(Saturday[i][3])
								 online[5][0]="Online"
						   }
						   else if(Saturday[i][1]=='10' && Saturday[i][2]=='11')
						   {
                                 timetable[5][1]=Saturday[i][0];
								 if(Saturday[i][3])
								 online[5][1]="Online"
						   }
						   else if(Saturday[i][1]=='11' && Saturday[i][2]=='12')
						   {
                                 timetable[5][2]=Saturday[i][0];
								 if(Saturday[i][3])
								 online[5][2]="Online"
						   }
						   else if(Saturday[i][1]=='12' && Saturday[i][2]=='13')
						   {
                                 timetable[5][3]=Saturday[i][0];
								 if(Saturday[i][3])
								 online[5][3]="Online"
						   }
						   else if(Saturday[i][1]=='13' && Saturday[i][2]=='14')
						   {
                                 timetable[5][4]=Saturday[i][0];
								 if(Saturday[i][3])
								 online[5][4]="Online"
						   }
						   else if(Saturday[i][1]=='14' && Saturday[i][2]=='15')
						   {
                                 timetable[5][5]=Saturday[i][0];
								 if(Saturday[i][3])
								 online[5][5]="Online"
					   }
					   }
					   console.log(timetable)
					  var weekdays=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
					    res.render("Student_Dashboard",{"Name":data.name,"id":data.reg_no,
					    "weekdays":weekdays,"timetable":timetable,
					    "online":online,"Stud_classNames":Stud_classNames,"classids":classids,
					  "Newsletter_List":Newsletter_List})
				  }
                    //in teacher dashboard we need to display all class, so search in class table if this teacher id is ther eor not 
                    //if this teacher id is there , then in a vector take classsnames and classids and render it to teacher dashboard 
                    var ClassNames=[];
                    var ClassIDs=[];
                    let ClassInfos=await Class.find({TeacherID:id_start});
                    
                    for(let ClassInfo of ClassInfos)
                    {                
                        ClassNames.push(ClassInfo.ClassName);
                        ClassIDs.push(ClassInfo.ClassID)
                    }
                    // console.log(ClassNames);
                    // console.log(ClassIDs);
				    if(id_start.substring(0, 1)=="T")
				    {
					  res.render("Teacher_Dashboard",{"Name":data.name,"id":data.reg_no,"ClassIDs":ClassIDs,"ClassNames":ClassNames})
				    }
				
			}else{
                res.render("Login",{"Error":"Wrong password!"})
				//res.send({"Success":"Wrong password!"});
			}
		}else{
            res.render("Register",{"Error":"This Email Is not registered,register here!"})
			//res.send({"Success":"This Email Is not regestered!"});
		}


	});
})

// Student Joins a class
// /<%= id %>/JoinClass/1/classid
app.post("/:sid/JoinClass",(req,res)=>{
	var online_bool=req.body.attendOnline;
	var class_to_join=req.body.ClassCode_of_newClass;
	//console.log(req.params.sid)
    // /if(student is already present in class then say)
	Class.findOne({ClassCode:class_to_join},function(err,data){
	  if(data)
	  {
		  var newData =new StudentClassReg({
			ClassCode:class_to_join,
			StudentID:req.params.sid,
			attendAsOnline:online_bool});
			newData.save(function(err,data){
			if(err)
			console.log(err);
			
		  })
		  res.render("success",{"info" :"Class Joined , Go back to dashboard"})
	  }
	  else
	  {
		res.render("fail",{"info" :"This class doesnot exist"})
		// res.send({"Fail":"This class doesnot exist"})
	  }
	})



  })

// Teacher creates new Class
app.get("/:id/newClass",(req,res)=>{
    var class_to_create=req.query.newClass;
	var teacherid=req.params.id;
	var length=4;
    
	var class_code=Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
	// var data=Class.findOne({ClassCode:class_code});
	// while( data )
	// {
	// 	class_code=Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
	// 	data=Class.findOne({ClassCode:class_code});
    // }
	Class.findOne({},function(err,data){
		var c;
		if (data) {
			//console.log("if");
			c = data.ClassID + 1;
		}else{
			c=1;
		}
        var newClass=new Class({
			ClassName:class_to_create,
			ClassID:c,
			TeacherID:teacherid,

			ClassCode: class_code
		})
		//save this class in "Classes" table
        newClass.save(function(err,Class){
			if(err)
			console.log(err);
			
		})
	}).sort({_id: -1}).limit(1);
    res.render("success",{"info" :"Class is created successfully, go back to the dashboard and reload"})
   // res.send({"Success":"Class is created successfully, go back to the dashboard to check"})
})



// delete existing class
app.get("/deleteClass/:cid",(req,res)=>{
	var classID=req.params.cid;
	StudentClassReg.deleteMany({ClassID:classID},function(err,data){
		if(err) console.log(err);
		// else
		// res.render("success",{"info" :"Class Deleted, Go back and reload the dashboard"})
	});
	ToggleClassMode.deleteMany({ClassID:classID},function(err,data){
		if(err) console.log(err);
		// else
		// res.render("success",{"info" :"Class Deleted, Go back and reload the dashboard"})
	});
	Chat.deleteMany({ClassID:classID},function(err,data){
		if(err) console.log(err);
		// else
		// res.render("success",{"info" :"Class Deleted, Go back and reload the dashboard"})
	});
	Class.deleteMany({ClassID:classID},function(err,data){
		if(err) console.log(err);
		else
		res.render("success",{"info" :"Class Deleted, Go back and reload the dashboard"})
	});
})

// Class Dashboard
// 2 main parts of class dashboard are 
// 1.Schedule
// 2.table with online count, offline count, approval count. 
app.get("/Class/:id",(req,res)=>{
    var classID=req.params.id;
	Class.findOne({ClassID:classID},async function(err,data){
	   console.log(data.ClassCode)
		var notifications=await ToggleClassMode.find({ClassCode:data.ClassCode})
		var listt= await StudentClassReg.find({ClassCode:data.ClassCode});
		var teacherid= await Class.findOne({ClassID:classID});
		var ClassTeacher= await User.findOne({reg_no:teacherid.TeacherID});
		//console.log(ClassTeacher.name)
		var online=[],offline=[],online_names=[],offline_names=[];
		//console.log(notifications)

        var currdate=new Date();
        for(let i=0;i<listt.length;i++)
		{
			//if(list)
			if(currdate>=listt[i].StartDate && currdate<=listt[i].EndDate && listt[i].attendAsOnline)
			{
				offline.push(listt[i].StudentID);
			}
			else if(currdate>=listt[i].StartDate && currdate<=listt[i].EndDate && listt[i].attendAsOnline==false)
			{
				online.push(listt[i].StudentID);
			}
			else if(listt[i].attendAsOnline)
			{
				online.push(listt[i].StudentID);
			}
			else
			{
				offline.push(listt[i].StudentID);
			}
		}
		
		for(let i=0;i<online.length;i++)
		{
			var temp= await Promise.resolve (User.findOne({$and:[{reg_no:online[i]},{role:"Student"}]}));
			online_names.push(temp.name)
		}
		for(let i=0;i<offline.length;i++)
		{
			var temp= await Promise.resolve (User.findOne({$and:[{reg_no:offline[i]},{role:"Student"}]}));
			offline_names.push(temp.name)
		}
		
		// console.log(online);
		// console.log(offline);
		// console.log(online_names);
		// console.log(offline_names);

        res.render("Class_Dashboard.ejs",{"ClassName":data.ClassName,"id":classID,"Schedule":data.Schedule,
		"notifications":notifications,"online":online,"offline":offline,"online_names":online_names
		,"offline_names":offline_names,"ClassTeacher":ClassTeacher.name , "ClassCode":teacherid.ClassCode,"Newsletter":teacherid.Newsletter})
	})

        
})

// Teacher edits the timing of schedule
app.post("/EditSchedule/:classid/:weekDay",(req,res)=>{
var classid=req.params.classid;
var weekDay=req.params.weekDay;
//console.log(weekDay)
Class.updateOne({ClassID:classid,"Schedule.dayIndex":weekDay},{$set:{"Schedule.$.startTime":req.body.startTime,"Schedule.$.endTime":req.body.endTime}},function(err,data){
	if(err)
	console.log(err)
	else{
		res.send({"Success":"Updated, go back to the dashboard to check"})
	}
})

})


// Teacher can add schedule 
app.get("/addToSchdule/:classid",(req,res)=>{
  var classid=req.params.classid;
  var weekday=req.query.weekday;
  var starttime=req.query.startTime;
  var endtime=req.query.endTime;
  if(endtime-starttime==1) 
  {
	  
	//res.send({"Fail":"Difference between end time must be 1"})
  
//  console.log(starttime)
  Class.updateOne(
	{ ClassID : classid },
	{
	  $push: {
		Schedule: {
		   $each: [ { dayIndex: weekday, startTime: starttime ,endTime:endtime} ],
		}
	  }
	}, (err,data)=>{
		if(err)
		console.log(err);
		else
		{
			res.render("success",{"info":"Updated, go back to the dashboard to check"})
		}
	}
 )
}
else
{
	res.render("fail",{"info":"Class can be of only 1 hour"})
}
})

// Newsletter begin

app.post("/DeleteNewsletter/:cid/:newsletterindex",(req,res)=>{
	var index=req.params.newsletterindex;
    var cid=req.params.cid;
   Class.findOne({ClassID:cid},async function(err,data){
	   if(err)
	   console.log(err);
	   else
	   {
		   data.Newsletter.splice(index,1);
		   
		  console.log(data.Newsletter);
		  var x = await Class.updateOne({ClassID:cid},{$set:{"Newsletter":data.Newsletter}})
		  res.send({"Success":"Updated, go back to the dashboard to check"})
	   }
	  
   })
})

app.post("/AddNews/:cid" , function(req,res){
	var notice=req.body.notice;
	var classId=req.params.cid;
	console.log(notice);
	console.log(classId);
//	var currDate = new Date();
	var currentdate = new Date(); 
    var datetime =currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
	console.log(datetime)
	Class.updateOne(
		{ ClassID : classId },
		{
		  $push: {
			Newsletter: {
			   $each: [ { Notice: notice, noticeDate:datetime} ],
			}
		  }
		}, (err,data)=>{
			if(err)
			console.log(err);
			else
			{
				res.send({"Success":"Updated, go back to the dashboard to check"})
			}
		}
	 )
})

// Newsletter ends

//Remove student from class

app.post("/:classcode/removeStudent",function(req,res){
	console.log("nf")
	var sid=req.body.studentid;
	var classCode=req.params.classcode;
	console.log(classCode)
	console.log(sid)
	//if sid is in studentclassregschema then remove it.
	StudentClassReg.findOne({ClassCode:classCode , StudentID:sid},async function(err,data){
		if(data)
		{
			var removee=await Promise.resolve(StudentClassReg.deleteOne({ClassCode:classCode , StudentID:sid}));
			var removefromApprovalList=await Promise.resolve(ToggleClassMode.deleteMany({ClassCode:classCode , StudentID:sid}));
			res.render("success",{"info":"This student is removed from your class."})
		}
		else
		{
			res.render("fail",{"info":"This student is not in your class."})
		}
	})
})

//ToggleCassModeSchema
// Student Toggle mode
app.post("/:id/ToggleMode",(req,res)=>{
StudentClassReg.findOne({ClassCode : req.body.classCode},function(err,data){
	if(data)
	{
		var newData =new ToggleClassMode({
			ClassCode:req.body.classCode,
			StudentID:req.params.id,
			StartDate:req.body.startDate,
			EndDate:req.body.endDate,
			Description:req.body.description
		})
		newData.save(function(err,ToggleClassMode){
			if(err)
				console.log(err);
				else
				console.log('Success');
		})
		res.render("success",{"info":"Request sent to the concerned teacher"})
	}
	else
	{
		res.render("fail",{"info":"This class dosenot exists."})
	}
})
	
})

// Change mode
app.post("/ChangeMode/:classcode/:sid/:start/:end",function(req,res){
	StudentClassReg.updateOne({ClassCode:req.params.classcode ,StudentID:req.params.sid},{$set:{StartDate:req.params.start,EndDate:req.params.end}},async function(err,data){
    if(err)
	console.log(err);
	else
	{
		console.log("added to table");
		ToggleClassMode.deleteOne({ClassCode:req.params.classcode ,StudentID:req.params.sid},function(err,data){
			if(err) console.log(err);
			else
			res.render("success",{"info":"approved"})
           // res.render({"Success":"Removed from ToggleClassMode"});
		})
		
	}
	})
})


const {formatMessage,formatOldMessage} = require('./utils/messages');
const {userJoin,getCurrentUser,userLeave,getRoomUsers} = require('./utils/users');
const e = require("cors");


app.post("/chat.html",function(req,res){
	Class.findOne({ClassCode:req.query.room},async function(err,data){
      //  console.log(data.TeacherID) 
        if(req.query.isteacher == 1)
		{
			res.render("teacher_chat",{"room":data.ClassName,"chatstudent":req.query.username})
		}
		else
		{
		
			var userinfo =await User.findOne({reg_no:data.TeacherID});
			var chatinfo =await Chat.find({Room:data.ClassCode,sender:userinfo.name,isTeacher:1});
		//	console.log(chatinfo);
			var teachermsg=[];
			var teacherMsgTime=[]
			for(let i=0;i<chatinfo.length;i++)
			{
				teachermsg.push(chatinfo[i].msg)
			}
			for(let i=0;i<chatinfo.length;i++)
			{
				var time=chatinfo[i].Time;
				var hour=time.getHours();
				if(time.getHours()>12)
                {
                  hour=hour-12;
                }
                var T = hour +":"+ time.getMinutes() ;
				teacherMsgTime.push(T)
			}
			console.log(teacherMsgTime);
			console.log(teachermsg)
			res.render("student_chat",{"room":data.ClassName,"chatstudent":req.query.username,
		    "teacherMsgTime":teacherMsgTime, "teachermsg":teachermsg })
		}
        // res.render("chat",{"room":data.ClassName,"chatstudent":req.query.username})
    })
	
})


io.on('connection', (socket) => {
	socket.on('joinRoom',({username,room,isteacher})=>{
    const user = userJoin(socket.id,username,room,isteacher);
	socket.join(user.room);
    Chat.find({Room: user.room}).sort('Time').exec((err, docs) => { 
		if(err) console.log(err);
		
		for(let i=0;i<docs.length;i++)
		{
		  io.to(user.room).emit('message', formatOldMessage(docs[i].sender, docs[i].msg, docs[i].Time));
		}
	   });
	// socket.emit('message', formatMessage(user.room,'Welcome to Class!'));
	socket.broadcast.to(user.room).emit('message',formatMessage('botname',`${user.username} joined the chat!`))
    io.to(user.room).emit('roomUsers',{
		room: user.room,
		users: getRoomUsers(user.room)
	})
	})
    socket.on('chatMessage',(msg)=>{
		const user=getCurrentUser(socket.id);
		console.log("this is"+user.isteacher)
		var newChat = new Chat({
			msg:msg,
			sender:user.username,
			Time : new Date(),
			Room:user.room,
			isTeacher:user.isteacher
		  });         
		  newChat.save(function(err, Chat){
			if(err)
			  console.log(err);
			else
			  console.log('Success');
		  })
	    io.to(user.room).emit('message',formatMessage(user.username,msg ))
   })

   //when client disconnects
	socket.on('disconnect',()=>{
		const user = userLeave(socket.id);
		if(user)
		{
			io.to(user.room).emit('message',formatMessage('botname',`${user.username} left the chat!`))
		    io.to(user.room).emit('roomUsers',{
				room: user.room,
				users: getRoomUsers(user.room)
			})
		}
		
	});

  });

 
server.listen(process.env.PORT||3000, () => {
	console.log('server has started');
  });
