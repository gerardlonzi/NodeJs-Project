document.addEventListener('DOMContentLoaded', () => {
        const tabNav = document.querySelectorAll('.auth a');
        const profile = document.querySelector(".profile")  

        const pathname = window.location.pathname;
    
        tabNav.forEach(el => {
            if (el.getAttribute('href') === pathname) {
                el.classList.add('nav-active');
            }
        });
        
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
                if (window.innerWidth < 1050) {
                        menu_ul.style.top = "4.2rem";
                }
                if (window.innerWidth < 640) {
                        menu_ul.style.top = "4.1rem";
                }
                if (window.innerWidth < 430) {
                        menu_ul.style.top = "3.4rem";
                }

        }
        else{
                menu.classList.remove("nav_fixed")
                menu_ul.style.top="130px"

     
        }
        
})

