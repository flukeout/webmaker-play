$("document").ready(function(){
   $("ul li").on("click",function(){
      var project = $(this).attr("project");
      window.localStorage.setItem("project",project);
      window.location.href = "index.html";
   });
});