const express = require("express");
const app = express();
const bodyParser=require("body-parser");
const { stringify } = require("querystring");
let ejs = require('ejs');
var path = require("path");
var mongoose = require('mongoose');
const { on } = require("events");
const { off } = require("process");
var Schema = mongoose.Schema;

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
	TeacherID:String, //this is basically teacher's reg_no
	Schedule:[{dayIndex : String , startTime : Number , endTime : Number }]
})

Class = mongoose.model('Class', ClassSchema);

StudentClassRegSchema = new Schema({
	ClassID:Number,
	StudentID:String,
	attendAsOnline:Boolean,
	StartDate:Date,
	EndDate:Date
})

StudentClassReg = mongoose.model('StudentClassReg', StudentClassRegSchema);

ToggleClassModeSchema = new Schema({
	ClassID:Number,
	StudentID:String,
	StartDate:Date,
	EndDate:Date,
	Description:String
})

ToggleClassMode = mongoose.model('ToggleClassMode',ToggleClassModeSchema);

app.get("/", (req, res) => {
    res.sendFile(__dirname+"/LandingPage.html");
});
app.get("/Register", (req, res) => {
    res.sendFile(__dirname+"/Register.html");
});

app.post("/User_Register",(req,res)=>{
	console.log(req.body);
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
							else
								console.log('Success');
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
					  //console.log(StudentClassRegInfos)
					  for(let StudentClassRegInfo of StudentClassRegInfos)
                      {                
                        classids.push(StudentClassRegInfo.ClassID);
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
					  for(let cid =0;cid<classids.length;cid++)
					  {
						var Schedule_temp;
						let Classinfos=await Promise.resolve(Class.find({ClassID:classids[cid]}));
						let attendAs=await Promise.resolve(StudentClassReg.find({ClassID:classids[cid],StudentID:id_start}));
						var att=attendAs[0].attendAsOnline;
						var currdate=new Date();
						Stud_classNames.push(Classinfos[0].ClassName);
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

					  var weekdays=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
					  res.render("Student_Dashboard",{"Name":data.name,"id":data.reg_no,"weekdays":weekdays,"timetable":timetable,"online":online,"Stud_classNames":Stud_classNames})
                     // res.render("Student_Dashboard",{"Name":data.name,"id":data.reg_no,"Monday":Monday,"Tuesday":Tuesday,"Wednesday":Wednesday,"Thursday":Thursday,"Friday":Friday})
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
	var class_to_join_id=req.body.ClassID_of_newClass;
	//console.log(req.params.sid)
    
	Class.findOne({ClassID:class_to_join_id},function(err,data){
	  if(data)
	  {
		  
		  var newData =new StudentClassReg({
			ClassID:class_to_join_id,
			StudentID:req.params.sid,
			attendAsOnline:online_bool});
  
			newData.save(function(err,data){
			if(err)
			console.log(err);
			else
			console.log('Success');
		  })
		  res.send({"Success":"Class Joined , Go back to dashboard"})
	  }
	  else
	  {
		res.send({"Fail":"This class doesnot exist"})
	  }
	})



  })

// Teacher creates new Class
app.get("/:id/newClass",(req,res)=>{
    var class_to_create=req.query.newClass;
	var teacherid=req.params.id;
	Class.findOne({},function(err,data){
		var c;
		if (data) {
			console.log("if");
			c = data.ClassID + 1;
		}else{
			c=1;
		}
        var newClass=new Class({
			ClassName:class_to_create,
			ClassID:c,
			TeacherID:teacherid
		})
		//save this class in "Classes" table
        newClass.save(function(err,Class){
			if(err)
			console.log(err);
			else
			console.log('Success');
		})
	}).sort({_id: -1}).limit(1);

    res.send({"Success":"Class is created successfully, go back to the dashboard to check"})
})

// Class Dashboard
// 2 main parts of class dashboard are 
// 1.Schedule
// 2.table with online count, offline count, approval count. 
app.get("/Class/:id",(req,res)=>{
    var classID=req.params.id;
    //using this id find classname and schedule.
	Class.findOne({ClassID:classID},async function(err,data){
		//console.log(data.Schedule[1].dayIndex);
		//serach in ToggleCassMode list of all where classsid=id
		var notifications=await ToggleClassMode.find({ClassID:classID})
		var listt= await StudentClassReg.find({ClassID:classID});
		//listt se check if the current date is between the start and date.
		//if currentdate is between the start and end then 
		//console.log(listt);
		var online=[],offline=[],online_names=[],offline_names=[];
		//console.log(notifications)
        for(let i=0;i<listt.length;i++)
		{
			//if(list)
			if(listt[i].attendAsOnline)
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
		
		console.log(online);
		console.log(offline);
		console.log(online_names);
		console.log(offline_names);

        res.render("Class_Dashboard.ejs",{"ClassName":data.ClassName,"id":classID,"Schedule":data.Schedule,
		"notifications":notifications,"online":online,"offline":offline,"online_names":online_names,"offline_names":offline_names})
	})

        //to represent list of students for online and offline
		//1. Find all students from studentclassreg table who has CLASSID AS CLASSID .
		//2. make 2 array of all student ids for online and for offline list .
		//3. Search the names of these ids in users and store the names in arrar.
		//4. render all 4 arrays (2 name's and 2 id's).
		//5. vvi i think this notifications can be kept out of that findone
        // StudentClassReg.find({ClassID:classID,attendAsOnline:true},function(err,data){
		// 	if(err)
		// 	console.log(err);
		// 	else
		// 	console.log(data);
		// });
        // StudentClassReg.find({ClassID:classID,attendAsOnline:false},function(err,data){
		// 	if(err)
		// 	console.log(err);
		// 	else
		// 	console.log(data);
		// });
        
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
  //console.log(weekday)
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
			res.send({"Success":"Updated, go back to the dashboard to check"})
		}
	}
 )
})
//ToggleCassModeSchema
// Student Toggle mode
app.post("/:id/ToggleMode",(req,res)=>{
//	console.log(req.body);
	var newData =new ToggleClassMode({
		ClassID:req.body.cid,
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
	res.send({"Success":"Submitted"})
})

// Change mode
app.post("/ChangeMode/:cid/:sid/:start/:end",function(req,res){
	console.log("approved");
	StudentClassReg.updateOne({ClassID:req.params.cid ,StudentID:req.params.sid},{$set:{StartDate:req.params.start,EndDate:req.params.end}},async function(err,data){
    if(err)
	console.log(err);
	else
	{
		console.log("added to table");
	    //delete this value .. code for this not written yet	
		ToggleClassMode.deleteOne({ClassID:req.params.cid ,StudentID:req.params.sid},function(err,data){
			if(err) console.log(err);
			else
            res.send({"Success":"Removed from ToggleClassMode"});
		})
		
	}
	})
})

app.listen(3000, () => {
    console.log('Express intro running on localhost:3000');
});