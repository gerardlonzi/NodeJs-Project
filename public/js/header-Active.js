document.addEventListener('DOMContentLoaded', () => {
        const tabNav = document.querySelectorAll('.auth a');
        const profile = document.querySelector(".profile")  

        const pathname = window.location.pathname;
    
        tabNav.forEach(el => {
            if (el.getAttribute('href') === pathname) {
                el.classList.add('nav-active');
            }
        });
        if(pathname==="/profile"){
                profile.style.display="none"
        }
    });

let isclick = false
const menu_hamburger = document.querySelector(".menu-hambuger")    
const menu_ul = document.querySelector(".menu ul")  
const menu = document.querySelector(".menu")  

menu_hamburger?.addEventListener("click",()=>{
        isclick=!isclick
        if(isclick==true){
                menu_ul.classList.toggle("show");        }
        else{
                menu_ul.classList.remove("show");
        }
})  
window.addEventListener("scroll",()=>{
        if(window.scrollY >360){
                menu.classList.add("nav_fixed")
        }
        else{
                menu.classList.remove("nav_fixed")
     
        }
        console.log(window.scrollY);
        
})

