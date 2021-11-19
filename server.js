const express = require("express");
const app = express();
const bodyParser=require("body-parser");
const { stringify } = require("querystring");
let ejs = require('ejs');
var path = require("path");
var mongoose = require('mongoose');
const { isGeneratorFunction } = require("util/types");
// const { FORMERR } = require("dns");
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
	attendAsOnline:Boolean
})

StudentClassReg = mongoose.model('StudentClassReg', StudentClassRegSchema);

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
					  var Schedule_temp=[];
					  var Monday=[];
					  var Tuseday=[];
					  var Wednesday=[];
					  var Thursday=[];
					  var Friday=[];
					  var Saturday=[];
					  for(let cid =0;cid<classids.length;cid++)
					  {
						var Schedule_temp;
						let Classinfos=await Promise.resolve(Class.find({ClassID:classids[cid]}));
						let attendAs=await Promise.resolve(StudentClassReg.find({ClassID:classids[cid]}));
						Schedule_temp=Classinfos[0].Schedule;
						var classname=Classinfos[0].ClassName;
						var bool_val=attendAs[0].attendAsOnline;
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
							    Tuseday.push(y);
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
                        for(let j=0;j<6;j++)
						{
                            inner_arr.push("Free");
							online.push(0)
						}
						timetable.push(inner_arr)
					  }
					  
					   for(let i=0;i<Monday.length;i++)
					   {
						   if(Monday[i][1]=='9' && Monday[i][2]=='10')
						   {
                                 timetable[0][0]=Monday[i][0];
								 online[0][0]=Monday[i][3];
						   }
						   else if(Monday[i][1]=='10' && Monday[i][2]=='11')
						   {
                                 timetable[0][1]=Monday[i][0];
								 online[0][1]=Monday[i][3];
						   }
						   else if(Monday[i][1]=='11' && Monday[i][2]=='12')
						   {
                                 timetable[0][2]=Monday[i][0];
								 online[0][2]=Monday[i][3];
						   }
						   else if(Monday[i][1]=='12' && Monday[i][2]=='13')
						   {
                                 timetable[0][3]=Monday[i][0];
								 online[0][3]=Monday[i][3];
						   }
						   else if(Monday[i][1]=='13' && Monday[i][2]=='14')
						   {
                                 timetable[0][4]=Monday[i][0];
								 online[0][4]=Monday[i][3];
						   }
						   else if(Monday[i][1]=='14' && Monday[i][2]=='15')
						   {
                                 timetable[0][5]=Monday[i][0];
								 online[0][5]=Monday[i][3];
						   }
					   }

					   //console.log(timetable);
					  // console.log(online)
					//    console.log(Monday);
					//    console.log(Tuseday);
					//    console.log(Wednesday)
					//    console.log(Thursday)
					//    console.log(Friday)
					//    console.log(Saturday)  
					  res.render("Student_Dashboard",{"Name":data.name,"id":data.reg_no,"Monday":Monday})
                     // res.render("Student_Dashboard",{"Name":data.name,"id":data.reg_no,"Monday":Monday,"Tuseday":Tuseday,"Wednesday":Wednesday,"Thursday":Thursday,"Friday":Friday})
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
	console.log(req.params.sid)
    
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
	Class.findOne({ClassID:classID},function(err,data){
		//console.log(data.Schedule[1].dayIndex);
        res.render("Class_Dashboard.ejs",{"ClassName":data.ClassName,"id":classID,"Schedule":data.Schedule})
	})
})

// Teacher edits the timing of schedule
app.post("/EditSchedule/:classid/:weekDay",(req,res)=>{
var classid=req.params.classid;
var weekDay=req.params.weekDay;
console.log(weekDay)
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
  console.log(weekday)
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
app.listen(3000, () => {
    console.log('Express intro running on localhost:3000');
});