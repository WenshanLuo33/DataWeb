document.addEventListener("DOMContentLoaded", function () {
    const reveals = document.querySelectorAll(".reveal");
  
    function revealOnScroll() {
      reveals.forEach((element) => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const revealPoint = 100;
  
        if (elementTop < windowHeight - revealPoint) {
          element.classList.add("visible");
        }
      });
    }
  
    window.addEventListener("scroll", revealOnScroll);
    revealOnScroll(); // 触发一次，防止页面刷新后首屏没有动画
  });
  
  document.addEventListener("DOMContentLoaded", function() {
    let firstProject = document.querySelector(".project");
    if (firstProject) {
        firstProject.style.marginTop = "100px"; // ✅ 可以改成任何你想要的数值
    }
});
