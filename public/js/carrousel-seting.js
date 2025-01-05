
const splite = document.querySelector("#my-carousel-nav")
console.log(splite);

document.addEventListener('DOMContentLoaded', function () {
    let splide = new Splide('#my-carousel', {
        type       : 'loop',  
        gap        : '2rem',   
        autoplay   : true,       
        pauseOnHover: true,       
        drag       : 'free',      
        perPage    : 3,
        breakpoints: {
            850: {
                perPage: 2,    
            },
            600: {
                perPage: 1,    
            },
        },
    });
    splide.mount();

    let splide_nav = new Splide('#my-carousel-nav', {
        type       : 'loop',  
        gap        : '0rem',   
        autoplay   : false,       
        pauseOnHover: true,       
        drag       : 'free',      
        perPage    : 3,
        breakpoints: {
            850: {
                perPage: 2,    
            },
            
        },
    });
    splide_nav.mount();
});
