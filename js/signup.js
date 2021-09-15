
const slidePage = document.querySelector(".slide-page");
const nextBtnFirst = document.querySelector(".firstNext");
const prevBtnSec = document.querySelector(".prev-1");
const nextBtnSec = document.querySelector(".next-1");
const prevBtnThird = document.querySelector(".prev-2");
const nextBtnThird = document.querySelector(".next-2");
const prevBtnFourth = document.querySelector(".prev-3");
// const submitBtn = document.querySelector(".submit");
const progressText = document.querySelectorAll(".step p");
const progressCheck = document.querySelectorAll(".step .check");
const bullet = document.querySelectorAll(".step .bullet");
let current = 1;

nextBtnFirst.addEventListener("click", function(event){
  var name=document.getElementById("name").value;
  // var prof=document.getElementById("profilepic");
  var idinp=document.getElementById("userid");
  var username=document.getElementById("username").value;
  var demo=document.getElementById("demo");
  var demo7=document.getElementById("demo7");
  var demo10=document.getElementById("demo10");
  
  if(name==''||username==''||!idinp.value)
  {
    console.log(idinp.value);
    if(!idinp.value)
    {
      demo10.innerHTML="! please choose id card";
    }
    else{
      demo10.innerHTML="";
    }
    if(name==''){
    text='! enter your name';
  demo.innerHTML=text;
  }
  else{
    demo.innerHTML='';
  }
  if(username==''){
    demo7.innerHTML='! enter the username';
  }
  else{
    demo7.innerHTML='';
  }
}
  else
  {
demo10.innerHTML='';
demo.innerHTML='';
demo7.innerHTML='';
  event.preventDefault();
  slidePage.style.marginLeft = "-25%";
  bullet[current - 1].classList.add("active");
  progressCheck[current - 1].classList.add("active");
  progressText[current - 1].classList.add("active");
  current += 1;
  }
});
nextBtnSec.addEventListener("click", function(event){
  var id=document.getElementById("email").value;
  var phone=document.getElementById("phone").value;
  var demo1=document.getElementById("demo1");
  var demo2=document.getElementById("demo2");
  if(id==''||id.slice(id.indexOf("@") + 1, id.indexOf(".")) !== "gmail"||phone==''||phone.length !== 10){
  if(id==''||id.slice(id.indexOf("@") + 1, id.indexOf(".")) !== "gmail")
  {
    text='! enter your gmail id';
  demo1.innerHTML=text;
  }
  else{
    demo1.innerHTML='';
  }
  if(phone==''||phone.lenth!== 10){
    text='! phone no is required';
  demo2.innerHTML=text;
  }
}
  else
  {
    demo1.innerHTML='';
    demo2.innerHTML='';
    event.preventDefault();
    slidePage.style.marginLeft = "-50%";
    bullet[current - 1].classList.add("active");
    progressCheck[current - 1].classList.add("active");
    progressText[current - 1].classList.add("active");
    current += 1;
  }
});
nextBtnThird.addEventListener("click", function(event){
  var clgname=document.getElementById("clgname").value;
  var course=document.getElementById("course").value;
  var syear=document.getElementById("syear").value;
  var eyear=document.getElementById("eyear").value;
  var demo3=document.getElementById("demo3");
  var demo4=document.getElementById("demo4");
  var demo5=document.getElementById("demo5");
  var demo6=document.getElementById("demo6");
  if(clgname==''||course==''||syear==''||eyear==''||clgname=='add'){
  if(clgname=='')
  {
    text='! select your college';
  demo3.innerHTML=text;
  }
  else if(clgname=='add'){
    demo3.innerHTML='! wait till your college is add in list';
  }
  else{
    demo3.innerHTML='';
  }
 if(course==''){
    text='! enter course';
  demo4.innerHTML=text;
  }
  else
  {
    demo4.innerHTML='';
  }
 if(syear==''){
    text='! enter starting year';
  demo5.innerHTML=text;
  }
  else{
    demo5.innerHTML='';
  }
if(eyear==''){
    text='! enter ending year';
  demo6.innerHTML=text;
  }
else{
  demo6.innerHTML='';
}
}
  else
  {
  event.preventDefault();
  slidePage.style.marginLeft = "-75%";
  bullet[current - 1].classList.add("active");
  progressCheck[current - 1].classList.add("active");
  progressText[current - 1].classList.add("active");
  current += 1;
  }
});
// submitBtn.addEventListener("click", function(e){
  // bullet[current - 1].classList.add("active");
  // progressCheck[current - 1].classList.add("active");
  // progressText[current - 1].classList.add("active");
  // current += 1;
  // setTimeout(function(){
  //   alert("Your Form Successfully Signed up");
  //   location.reload();
  // },800);
  // 
// });

prevBtnSec.addEventListener("click", function(event){
  event.preventDefault();
  slidePage.style.marginLeft = "0%";
  bullet[current - 2].classList.remove("active");
  progressCheck[current - 2].classList.remove("active");
  progressText[current - 2].classList.remove("active");
  current -= 1;
});
prevBtnThird.addEventListener("click", function(event){
  event.preventDefault();
  slidePage.style.marginLeft = "-25%";
  bullet[current - 2].classList.remove("active");
  progressCheck[current - 2].classList.remove("active");
  progressText[current - 2].classList.remove("active");
  current -= 1;
});
prevBtnFourth.addEventListener("click", function(event){
  event.preventDefault();
  slidePage.style.marginLeft = "-50%";
  bullet[current - 2].classList.remove("active");
  progressCheck[current - 2].classList.remove("active");
  progressText[current - 2].classList.remove("active");
  current -= 1;
});