
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

// script.js
let currentCourseId = null;

const courseDetails = {
    1: {
        title: "Computerised Accounting and Management",
        description: "Unlock the power of modern accounting systems in this comprehensive course! You will learn how to use computerised accounting software to manage financial records, generate reports, and perform complex calculations. This course will equip you with the essential skills needed to streamline financial management in businesses of all sizes. By the end of this course, you will have a solid understanding of computerized accounting and be able to manage accounts efficiently using industry-standard tools.",
        duration: "Duration: 4 weeks",
        certification: "Certification recognized upon course completion.",
        requirements: "Basic knowledge of mathematics and an interest in business administration or finance."
    },
    2: {
        title: "Computer Maintenance",
        description: "This course is designed for anyone interested in understanding the inner workings of computers and how to maintain them. From diagnosing hardware issues to troubleshooting software problems, you will learn essential skills to keep computer systems running smoothly. We will cover topics like hardware assembly, software installation, data recovery, and system optimization. By the end of the course, you'll be confident in your ability to maintain and repair computers, making you an invaluable asset in any tech environment.",
        duration: "Duration: 6 weeks",
        certification: "Certification recognized after course completion.",
        requirements: "No prior experience necessary, though a basic understanding of computer functions is helpful."
    },
    3: {
        title: "Webmaster / Web Developer",
        description: "This course will teach you the foundational skills needed to build and maintain websites, from front-end design to back-end development. You will dive into HTML, CSS, and JavaScript to create interactive and user-friendly websites. You’ll also learn how to integrate websites with databases and manage server-side functionality. Whether you're aiming for a career as a webmaster or a web developer, this course will provide you with the knowledge and skills to create fully functional websites that engage users and meet business needs.",
        duration: "Duration: 8 weeks",
        certification: "Get certified after completing the course.",
        requirements: "Basic knowledge of computers and an interest in web development. No prior coding experience required."
    },
    4: {
        title: "Professional Hairdresser",
        description: "Step into the world of professional hairstyling! This course offers a deep dive into advanced hairdressing techniques, including cutting, coloring, styling, and hair treatments. You’ll learn the latest trends in hair care and how to provide personalized services to clients, ensuring their hair looks and feels amazing. This course is ideal for anyone looking to start a career as a hairdresser or refine their skills in the beauty industry. By the end of the course, you will be ready to work confidently in a salon or run your own freelance hairdressing business.",
        duration: "Duration: 6 weeks",
        certification: "Certification provided after successful completion.",
        requirements: "No prior experience required, though a passion for beauty and creativity will be helpful."
    },
    5: {
        title: "Beauty Care / Cosmetology",
        description: "Become an expert in beauty care and cosmetology with this hands-on course. You will learn a range of beauty treatments, including facials, manicures, pedicures, waxing, and makeup application. This course is designed to give you a deep understanding of the science behind skin care and beauty treatments, along with practical skills for delivering professional services. Perfect for anyone aspiring to work in a beauty salon, spa, or as a freelance cosmetologist, this course will prepare you for a successful career in the beauty industry.",
        duration: "Duration: 7 weeks",
        certification: "Earn a certificate upon completion of the course.",
        requirements: "No prior experience required. A basic interest in beauty care and self-presentation is ideal."
    },
    6: {
        title: "Office Automation Secretaryship",
        description: "This course is designed to enhance your office skills and introduce you to the latest office automation tools. You will learn how to use software for scheduling, communication, data management, and document preparation, essential for any administrative position. The course covers everything from word processing to advanced spreadsheet management, as well as office organization and time management strategies. By the end of the course, you will be fully equipped to manage an office environment efficiently and professionally.",
        duration: "Duration: 5 weeks",
        certification: "Certification available upon completion.",
        requirements: "Basic computer literacy and an interest in office management or administration."
    },
    7: {
        title: "Accounting Secretaryship",
        description: "This course focuses on the administrative side of accounting. You will learn how to assist accountants in tasks such as preparing financial reports, managing accounts, maintaining accurate records, and ensuring compliance with legal standards. The course covers key concepts in accounting, bookkeeping, and office management, providing a strong foundation for anyone looking to work as an accounting secretary or assistant. By the end of this course, you will have the practical knowledge needed to support financial departments in any organization.",
        duration: "Duration: 6 weeks",
        certification: "Certification provided after completing the course.",
        requirements: "Basic knowledge of mathematics and an interest in accounting or business administration."
    },
    8: {
        title: "English Language for IELTS",
        description: "Prepare for the IELTS exam with this comprehensive course. You will improve your reading, writing, speaking, and listening skills in English, with a focus on the IELTS exam format. This course includes targeted practice sessions, sample tests, and expert strategies to help you achieve a high score. Whether you're planning to study abroad or work in an English-speaking environment, this course will equip you with the language skills and exam techniques you need to succeed.",
        duration: "Duration: 8 weeks",
        certification: "IELTS preparation certificate provided.",
        requirements: "Basic knowledge of English. This course is ideal for anyone preparing for the IELTS exam."
    },
    9: {
        title: "Fashion Designing and Sewing",
        description: "Unleash your creativity in fashion design with this hands-on course. Learn the art of fashion illustration, pattern making, fabric selection, and garment construction. You will also learn how to sew professionally and create your own clothing line. This course is perfect for anyone interested in pursuing a career in fashion design or starting their own brand. By the end of the course, you'll have the practical skills and knowledge needed to bring your fashion ideas to life.",
        duration: "Duration: 10 weeks",
        certification: "Certification awarded after completion.",
        requirements: "No prior experience required, but a passion for fashion and creativity is essential."
    },
    10: {
        title: "Hotel Management - Kitchen - Bar - Restaurant",
        description: "Dive into the world of hospitality with this comprehensive hotel management course. You will learn the ins and outs of hotel operations, focusing on the kitchen, bar, and restaurant management. From kitchen management and food preparation to handling customer service and managing bar operations, this course covers all aspects of hospitality management. By the end of this course, you will be prepared to manage any hospitality establishment, ensuring smooth operations and exceptional guest experiences.",
        duration: "Duration: 12 weeks",
        certification: "Complete the course and earn your certification.",
        requirements: "No prior experience necessary, though a passion for the hospitality industry and customer service is a plus."
    },
    11: {
        title: "Digital Marketing",
        description: "Become an expert in digital marketing with this in-depth course. You will learn how to plan and execute digital marketing campaigns across various channels such as social media, email marketing, SEO, and content marketing. This course covers analytics, paid advertising, and brand management, ensuring you have the tools needed to promote businesses effectively in the digital space. Whether you're looking to boost your career or start your own digital marketing agency, this course will set you on the right path.",
        duration: "Duration: 8 weeks",
        certification: "Certification awarded after course completion.",
        requirements: "No prior experience required. A basic understanding of online platforms and marketing will be helpful."
    }
};

function showCourseDetails(courseId) {
    currentCourseId = courseId;

    const course = courseDetails[courseId];

    // Mettre à jour les éléments HTML avec les données du cours
    document.getElementById("course-title").textContent = course.title;
    document.getElementById("course-description").textContent = course.description;
    document.getElementById("course-duration").textContent = course.duration;
    document.getElementById("course-certification").textContent = course.certification;
    document.getElementById("course-requirements").textContent = course.requirements;

    // Ajouter la classe 'show' pour faire apparaître les détails avec animation
    const detailsSection = document.getElementById("course-details");
    detailsSection.classList.add("show");

    // Afficher la section de détails
    detailsSection.style.display = "block";
}

function closeCourseDetails() {
    // Masquer la section des détails du cours avec animation
    const detailsSection = document.getElementById("course-details");
    detailsSection.classList.remove("show");
    setTimeout(() => {
        detailsSection.style.display = "none";
    }, 500); // délai égal à la durée de l'animation
}

function changeCourse(direction) {
    const detailsSection = document.getElementById("course-details");

    // Masquer l'actuel cours avec animation
    detailsSection.classList.remove("show");

    setTimeout(() => {
        // Mettre à jour l'ID du cours selon la direction (prev ou next)
        if (direction === 'next') {
            if (currentCourseId < Object.keys(courseDetails).length) {
                currentCourseId++;
            }
        } else if (direction === 'prev') {
            if (currentCourseId > 1) {
                currentCourseId--;
            }
        }

        // Afficher le prochain cours après l'animation de disparition
        showCourseDetails(currentCourseId);
    }, 500); // délai égal à la durée de l'animation avant de changer de cours
}

function backToList() {
    // Retourner à la liste des cours et masquer les détails
    closeCourseDetails();
}
