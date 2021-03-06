# Scheduler-Chat-NoticeBoard for classrooms
<h4>Hosted Version : https://connecting-classrooms.herokuapp.com/ </h4>
<hr>

<h3>About::heavy_check_mark:</h3><br>
The ideas behind building this project were :<br>
 1. To create a setup where student can have an option to attend class in both modes.:school:	:house_with_garden:	<br>
 2. Make a safe and secure chat room for each class for communication.:speech_balloon:	<br> 
 3. A virtual notice board.:scroll:<br> 

<hr>

<h3 >Features :bell:	</h3>
 <h4>User registeration and login </h4><br>
 1. Both teacher and student will have same registeration page. <br>
 2. Usually in schools and colleges register number distinguishes student and teacher. <br>
 3. For the sake of project here  I have assumed : <br>
 3.1. A student has the registration number starting with "S".<br>
 3.2. A teacher has registration number starting with "T". <br>
 
<h4>Teacher Dashboard Features</h4><br>
 1. This dashboard will have all classes cards that will be redirect to each class's dashboard. <br>
 2. Teacher can create new class. <br>
 3. Teahcer can delete any existing class. <br>
 
<h4>Student Dashboard Features</h4><br>
1. Weekly Schedule : A weekly schedule showing subject and mode to attending. <br>
2. Join new class : A student can join class with the class code that the teacher provides and set default preference of attending it online or offline. <br>
3. Change the default mode of attending class : A student can request to change the default mode for a duration of days. Once the teacher approves the request made then it will    be reflected in weekly schedule. <br>
4. Notice Board : Student can see notice board of their classes. <br>
5. Chatroom: Chat room of all classes. <br>

<h4>Class Dashboard Features</h4><br>
1. Setup weekly schedule. <br>
2. Edit weekly schedule. <br>
3. Add notice in notice board.<br>
4. Delete notice in notice board. </br>
5. Remove student from class.<br>
6. See list of students coming online and coming offline.<br>
7. Approve requests made by students for changing their mode of attending.<br>
8. Chatroom.<br>

<h4>Chat Dashboard Features</h4><br>
1. Separate chatroom for each class.<br>
2. List of users (students of the classs and classteacher) currently active can be seen.<br>
3. Student's chat dashboard has an option to see all the message sent by that subject teacher.<br>
4. If a student messages a bad word , then that message wont be displayed.<br>

<h3>Assumptions :grey_exclamation:</h3> <br>
1. Teacher's register number starts from "T". <br>
2. Student's register number starts from "S" . <br>
3. In schools and colleges class timings never clash and hence in this project as well , no 2 class will be at the same time. <br>
4. Classes will be 1 hour long . <br>

<hr>

<h3>Run Locally for Development :hammer_and_wrench:</h3> <br>
1. Clone this repository.<br>
2. Run npm i in the root directory.<br>
3 .Run node server.js to start the server.<br>
4 .In your browser of choice, go to localhost:3000 to see the website.<br>
<hr>
