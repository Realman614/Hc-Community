/* =========================================================
   HC-COMMUNITY
   PRE-1.0.0

   Firebase Authentication + Cloud Firestore.

   Account access uses Firebase Authentication.
   Profiles, communities, memberships, posts, replies and likes
   use Cloud Firestore.
   Shared community data is stored in Cloud Firestore.
========================================================= */


/* =========================================================
   SMALL HELPERS
========================================================= */

function clamp(value, min = 0, max = 1) {
    return Math.min(
        Math.max(value, min),
        max
    );
}


function progressRange(
    progress,
    start,
    end
) {
    return clamp(
        (progress - start) /
        (end - start)
    );
}


function smoothStep(value) {

    const safeValue =
        clamp(value);

    return (
        safeValue *
        safeValue *
        (3 - 2 * safeValue)
    );
}


function getSceneProgress(scene) {

    if (!scene) {
        return 0;
    }

    const rect =
        scene.getBoundingClientRect();

    const scrollableDistance =
        scene.offsetHeight -
        window.innerHeight;

    if (scrollableDistance <= 0) {
        return 0;
    }

    return clamp(
        -rect.top /
        scrollableDistance
    );
}


function escapeId(text) {

    return String(text)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}


function makeId(prefix = "id") {

    return (
        `${prefix}-${Date.now()}-` +
        Math.random()
            .toString(36)
            .slice(2, 8)
    );
}


function formatTime(timestamp) {

    const date =
        new Date(timestamp);

    return date.toLocaleString(
        undefined,
        {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );
}


/* =========================================================
   WELCOME ELEMENTS
========================================================= */

const welcomeExperience =
    document.getElementById(
        "welcomeExperience"
    );

const welcomeNav =
    document.querySelector(
        ".welcome-nav"
    );

const progressBar =
    document.querySelector(
        ".scroll-progress-bar"
    );


const introScene =
    document.querySelector(
        ".scene-intro"
    );

const heroTitle =
    document.querySelector(
        ".hero-title"
    );

const heroDescription =
    document.querySelector(
        ".hero-description"
    );

const introSmallText =
    document.querySelector(
        ".intro-small-text"
    );

const scrollHint =
    document.querySelector(
        ".scroll-hint"
    );

const orbitItems =
    document.querySelectorAll(
        ".orbit-item"
    );


const communitiesScene =
    document.querySelector(
        ".scene-communities"
    );

const communityLines =
    document.querySelectorAll(
        ".reveal-line"
    );

const communityDescription =
    document.querySelector(
        ".community-copy .scene-description"
    );

const floatingCards =
    document.querySelectorAll(
        ".floating-community-card"
    );


const channelsScene =
    document.querySelector(
        ".scene-channels"
    );

const channelsDemo =
    document.querySelector(
        ".channels-demo"
    );

const channelsCopy =
    document.querySelector(
        ".channels-copy"
    );

const demoMessages =
    document.querySelectorAll(
        ".demo-message"
    );


const postsScene =
    document.querySelector(
        ".scene-posts"
    );

const postsCopy =
    document.querySelector(
        ".posts-copy"
    );

const welcomePosts =
    document.querySelectorAll(
        ".welcome-post-card"
    );


const eventsScene =
    document.querySelector(
        ".scene-events"
    );

const eventsCopy =
    document.querySelector(
        ".events-copy"
    );

const welcomeEvents =
    document.querySelectorAll(
        ".welcome-event-card"
    );


const discoverScene =
    document.querySelector(
        ".scene-discover"
    );

const discoverDemo =
    document.querySelector(
        ".discover-demo"
    );

const discoverCopy =
    document.querySelector(
        ".discover-copy"
    );


const finalScene =
    document.querySelector(
        ".scene-final"
    );

const finalContent =
    document.querySelector(
        ".final-content"
    );


/* =========================================================
   WELCOME ANIMATION
========================================================= */

function updateGlobalProgress() {

    if (!progressBar) {
        return;
    }

    const scrollableHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

    const progress =
        scrollableHeight > 0
            ? window.scrollY /
                scrollableHeight
            : 0;

    progressBar.style.width =
        `${progress * 100}%`;
}


/* =========================================================
   INTRO
========================================================= */

function animateIntro() {

    if (
        !introScene ||
        !heroTitle
    ) {
        return;
    }

    const progress =
        getSceneProgress(
            introScene
        );

    const movement =
        smoothStep(
            progressRange(
                progress,
                0.08,
                0.72
            )
        );

    const exit =
        smoothStep(
            progressRange(
                progress,
                0.68,
                0.96
            )
        );


    heroTitle.style.transform =
        `
        translateY(${-150 * movement}px)
        scale(${1 - movement * 0.38})
        `;

    heroTitle.style.opacity =
        String(1 - exit);

    heroTitle.style.filter =
        `blur(${exit * 9}px)`;


    if (heroDescription) {

        heroDescription.style.transform =
            `
            translateY(${-75 * movement}px)
            `;

        heroDescription.style.opacity =
            String(
                1 -
                progressRange(
                    progress,
                    0.4,
                    0.72
                )
            );
    }


    if (introSmallText) {

        introSmallText.style.opacity =
            String(
                1 -
                progressRange(
                    progress,
                    0.12,
                    0.38
                )
            );
    }


    if (scrollHint) {

        scrollHint.style.opacity =
            String(
                1 -
                progressRange(
                    progress,
                    0.02,
                    0.15
                )
            );
    }


    orbitItems.forEach(
        (item, index) => {

            const directions = [
                [-120, 140],
                [130, 145],
                [-100, -70],
                [110, -65],
                [0, -150]
            ];

            const direction =
                directions[index] ||
                [0, 100];

            item.style.transform =
                `
                translate(
                    ${direction[0] * movement}px,
                    ${direction[1] * movement}px
                )
                scale(${1 + movement * 0.12})
                `;

            item.style.opacity =
                String(
                    1 -
                    progressRange(
                        progress,
                        0.7,
                        0.94
                    )
                );
        }
    );
}


/* =========================================================
   COMMUNITIES
========================================================= */

function animateCommunities() {

    if (!communitiesScene) {
        return;
    }

    const progress =
        getSceneProgress(
            communitiesScene
        );

    const exit =
        smoothStep(
            progressRange(
                progress,
                0.76,
                0.98
            )
        );


    communityLines.forEach(
        (line, index) => {

            const enter =
                smoothStep(
                    progressRange(
                        progress,
                        0.07 +
                            index * 0.09,
                        0.3 +
                            index * 0.09
                    )
                );

            line.style.opacity =
                String(
                    enter *
                    (1 - exit)
                );

            line.style.transform =
                `
                translateY(
                    ${
                        70 *
                        (1 - enter) -
                        50 *
                        exit
                    }px
                )
                `;

            line.style.filter =
                `
                blur(
                    ${
                        (1 - enter) * 7 +
                        exit * 5
                    }px
                )
                `;
        }
    );


    if (communityDescription) {

        const descriptionEnter =
            smoothStep(
                progressRange(
                    progress,
                    0.3,
                    0.55
                )
            );

        communityDescription.style.opacity =
            String(
                descriptionEnter *
                (1 - exit)
            );

        communityDescription.style.transform =
            `
            translateY(
                ${25 * (1 - descriptionEnter)}px
            )
            `;
    }


    floatingCards.forEach(
        (card, index) => {

            const enter =
                smoothStep(
                    progressRange(
                        progress,
                        0.28 +
                            index * 0.06,
                        0.55 +
                            index * 0.05
                    )
                );

            const x =
                index === 0
                    ? -50
                    : index === 1
                        ? 50
                        : 0;

            const y =
                index === 2
                    ? 55
                    : -35;

            card.style.opacity =
                String(
                    enter *
                    (1 - exit)
                );

            card.style.transform =
                `
                translate(
                    ${
                        index === 2
                            ? "-50%"
                            : `${x * (1 - enter)}px`
                    },
                    ${y * (1 - enter)}px
                )
                scale(
                    ${0.94 + enter * 0.06}
                )
                `;
        }
    );
}


/* =========================================================
   CHANNELS
========================================================= */

function animateChannels() {

    if (!channelsScene) {
        return;
    }

    const progress =
        getSceneProgress(
            channelsScene
        );

    const enter =
        smoothStep(
            progressRange(
                progress,
                0.08,
                0.4
            )
        );

    const exit =
        smoothStep(
            progressRange(
                progress,
                0.8,
                1
            )
        );


    if (channelsDemo) {

        channelsDemo.style.opacity =
            String(
                enter *
                (1 - exit)
            );

        channelsDemo.style.transform =
            `
            translateX(
                ${-100 * (1 - enter)}px
            )
            scale(
                ${0.92 + enter * 0.08}
            )
            `;
    }


    if (channelsCopy) {

        const copyEnter =
            smoothStep(
                progressRange(
                    progress,
                    0.17,
                    0.48
                )
            );

        channelsCopy.style.opacity =
            String(
                copyEnter *
                (1 - exit)
            );

        channelsCopy.style.transform =
            `
            translateX(
                ${80 * (1 - copyEnter)}px
            )
            `;
    }


    demoMessages.forEach(
        (message, index) => {

            const messageEnter =
                smoothStep(
                    progressRange(
                        progress,
                        0.35 +
                            index * 0.1,
                        0.58 +
                            index * 0.1
                    )
                );

            message.style.opacity =
                String(
                    messageEnter *
                    (1 - exit)
                );

            message.style.transform =
                `
                translateY(
                    ${30 * (1 - messageEnter)}px
                )
                `;
        }
    );
}


/* =========================================================
   POSTS
========================================================= */

function animatePosts() {

    if (!postsScene) {
        return;
    }

    const progress =
        getSceneProgress(
            postsScene
        );

    const exit =
        smoothStep(
            progressRange(
                progress,
                0.82,
                1
            )
        );


    if (postsCopy) {

        const enter =
            smoothStep(
                progressRange(
                    progress,
                    0.07,
                    0.36
                )
            );

        postsCopy.style.opacity =
            String(
                enter *
                (1 - exit)
            );

        postsCopy.style.transform =
            `
            translateX(
                ${-80 * (1 - enter)}px
            )
            `;
    }


    welcomePosts.forEach(
        (post, index) => {

            const enter =
                smoothStep(
                    progressRange(
                        progress,
                        0.18 +
                            index * 0.1,
                        0.47 +
                            index * 0.1
                    )
                );

            post.style.opacity =
                String(
                    enter *
                    (1 - exit)
                );

            post.style.transform =
                `
                translateY(
                    ${80 * (1 - enter)}px
                )
                scale(
                    ${0.94 + enter * 0.06}
                )
                `;
        }
    );
}


/* =========================================================
   EVENTS
========================================================= */

function animateEvents() {

    if (!eventsScene) {
        return;
    }

    const progress =
        getSceneProgress(
            eventsScene
        );

    const exit =
        smoothStep(
            progressRange(
                progress,
                0.82,
                1
            )
        );


    if (eventsCopy) {

        const enter =
            smoothStep(
                progressRange(
                    progress,
                    0.07,
                    0.36
                )
            );

        eventsCopy.style.opacity =
            String(
                enter *
                (1 - exit)
            );
    }


    welcomeEvents.forEach(
        (eventCard, index) => {

            const enter =
                smoothStep(
                    progressRange(
                        progress,
                        0.18 +
                            index * 0.1,
                        0.47 +
                            index * 0.1
                    )
                );

            eventCard.style.opacity =
                String(
                    enter *
                    (1 - exit)
                );

            eventCard.style.transform =
                `
                translateX(
                    ${100 * (1 - enter)}px
                )
                `;
        }
    );
}


/* =========================================================
   DISCOVER
========================================================= */

function animateDiscover() {

    if (!discoverScene) {
        return;
    }

    const progress =
        getSceneProgress(
            discoverScene
        );

    const enter =
        smoothStep(
            progressRange(
                progress,
                0.08,
                0.42
            )
        );

    const exit =
        smoothStep(
            progressRange(
                progress,
                0.82,
                1
            )
        );


    if (discoverDemo) {

        discoverDemo.style.opacity =
            String(
                enter *
                (1 - exit)
            );

        discoverDemo.style.transform =
            `
            translateX(
                ${-90 * (1 - enter)}px
            )
            scale(
                ${0.94 + enter * 0.06}
            )
            `;
    }


    if (discoverCopy) {

        const copyEnter =
            smoothStep(
                progressRange(
                    progress,
                    0.18,
                    0.5
                )
            );

        discoverCopy.style.opacity =
            String(
                copyEnter *
                (1 - exit)
            );

        discoverCopy.style.transform =
            `
            translateX(
                ${80 * (1 - copyEnter)}px
            )
            `;
    }
}


/* =========================================================
   FINAL
========================================================= */

function animateFinal() {

    if (
        !finalScene ||
        !finalContent
    ) {
        return;
    }

    const progress =
        getSceneProgress(
            finalScene
        );

    const enter =
        smoothStep(
            progressRange(
                progress,
                0.03,
                0.55
            )
        );

    finalContent.style.opacity =
        String(enter);

    finalContent.style.transform =
        `
        translateY(
            ${70 * (1 - enter)}px
        )
        scale(
            ${0.94 + enter * 0.06}
        )
        `;
}


/* =========================================================
   WELCOME MASTER LOOP
========================================================= */

let scrollTicking = false;


function updateWelcomeAnimations() {

    updateGlobalProgress();
    animateIntro();
    animateCommunities();
    animateChannels();
    animatePosts();
    animateEvents();
    animateDiscover();
    animateFinal();

    scrollTicking = false;
}


function requestWelcomeAnimation() {

    if (scrollTicking) {
        return;
    }

    scrollTicking = true;

    window.requestAnimationFrame(
        updateWelcomeAnimations
    );
}


window.addEventListener(
    "scroll",
    requestWelcomeAnimation,
    {
        passive: true
    }
);


window.addEventListener(
    "resize",
    requestWelcomeAnimation
);


/* =========================================================
   DEFAULT COMMUNITY DATA
========================================================= */

const defaultCommunities = [

    {
        id: "basketball",
        name: "Basketball",
        icon: "🏀",
        category: "SPORTS",
        description:
            "Players and fans sharing games, training, highlights and everything basketball.",
        members: 0,

        channels: [
            {
                id: "general",
                name: "general",
                description:
                    "General basketball conversation."
            },

            {
                id: "games",
                name: "games",
                description:
                    "Matches, scores and upcoming games."
            },

            {
                id: "training",
                name: "training",
                description:
                    "Training sessions, drills and practice."
            },

            {
                id: "highlights",
                name: "highlights",
                description:
                    "Share great plays and memorable moments."
            }
        ]
    },


    {
        id: "fencing",
        name: "Fencing",
        icon: "🤺",
        category: "SPORTS",
        description:
            "Training, competitions, equipment and fencing discussion around school.",
        members: 0,

        channels: [
            {
                id: "general",
                name: "general",
                description:
                    "General fencing conversation."
            },

            {
                id: "training",
                name: "training",
                description:
                    "Training schedules and practice."
            },

            {
                id: "competitions",
                name: "competitions",
                description:
                    "Competition information and results."
            },

            {
                id: "equipment",
                name: "equipment",
                description:
                    "Talk about equipment and preparation."
            }
        ]
    },


    {
        id: "football",
        name: "Football",
        icon: "⚽",
        category: "SPORTS",
        description:
            "Matches, training, teams and football around school.",
        members: 0,

        channels: [
            {
                id: "general",
                name: "general",
                description:
                    "General football conversation."
            },

            {
                id: "matches",
                name: "matches",
                description:
                    "Match information and results."
            },

            {
                id: "training",
                name: "training",
                description:
                    "Training and practice."
            },

            {
                id: "teams",
                name: "teams",
                description:
                    "Team discussion and organization."
            }
        ]
    },


    {
        id: "math",
        name: "Math Study",
        icon: "📐",
        category: "ACADEMIC",
        description:
            "Study together, solve problems, share notes and prepare for competitions.",
        members: 0,

        channels: [
            {
                id: "general",
                name: "general",
                description:
                    "General math discussion."
            },

            {
                id: "homework",
                name: "homework",
                description:
                    "Discuss homework and difficult problems."
            },

            {
                id: "resources",
                name: "resources",
                description:
                    "Notes, worksheets and useful resources."
            },

            {
                id: "competitions",
                name: "competitions",
                description:
                    "AMC and other competition preparation."
            }
        ]
    },


    {
        id: "science",
        name: "Science",
        icon: "🔬",
        category: "ACADEMIC",
        description:
            "Science discussions, experiments, revision and study help.",
        members: 0,

        channels: [
            {
                id: "general",
                name: "general",
                description:
                    "General science discussion."
            },

            {
                id: "experiments",
                name: "experiments",
                description:
                    "Experiments and project ideas."
            },

            {
                id: "help",
                name: "help",
                description:
                    "Ask science questions and help each other."
            },

            {
                id: "resources",
                name: "resources",
                description:
                    "Study materials and useful resources."
            }
        ]
    },


    {
        id: "coding",
        name: "Coding",
        icon: "💻",
        category: "TECHNOLOGY",
        description:
            "Build projects, learn programming, ask questions and share ideas.",
        members: 0,

        channels: [
            {
                id: "general",
                name: "general",
                description:
                    "General coding discussion."
            },

            {
                id: "projects",
                name: "projects",
                description:
                    "Share and collaborate on coding projects."
            },

            {
                id: "help",
                name: "help",
                description:
                    "Ask programming questions."
            },

            {
                id: "resources",
                name: "resources",
                description:
                    "Tutorials, tools and learning resources."
            }
        ]
    },


    {
        id: "art",
        name: "Art",
        icon: "🎨",
        category: "CREATIVE",
        description:
            "Share artwork, techniques, inspiration and creative projects.",
        members: 0,

        channels: [
            {
                id: "general",
                name: "general",
                description:
                    "General art conversation."
            },

            {
                id: "showcase",
                name: "showcase",
                description:
                    "Show the community what you've created."
            },

            {
                id: "feedback",
                name: "feedback",
                description:
                    "Ask for constructive feedback."
            },

            {
                id: "resources",
                name: "resources",
                description:
                    "Art resources and inspiration."
            }
        ]
    },


    {
        id: "music",
        name: "Music",
        icon: "🎵",
        category: "CREATIVE",
        description:
            "Musicians, performances, practice and everything music.",
        members: 0,

        channels: [
            {
                id: "general",
                name: "general",
                description:
                    "General music conversation."
            },

            {
                id: "performances",
                name: "performances",
                description:
                    "Upcoming performances and recitals."
            },

            {
                id: "practice",
                name: "practice",
                description:
                    "Practice sessions and advice."
            },

            {
                id: "share",
                name: "share",
                description:
                    "Share music and performances."
            }
        ]
    },


    {
        id: "photography",
        name: "Photography",
        icon: "📷",
        category: "CREATIVE",
        description:
            "Share photos, learn photography and take on creative challenges.",
        members: 0,

        channels: [
            {
                id: "general",
                name: "general",
                description:
                    "General photography discussion."
            },

            {
                id: "showcase",
                name: "showcase",
                description:
                    "Share your latest photos."
            },

            {
                id: "tips",
                name: "tips",
                description:
                    "Photography tips and techniques."
            },

            {
                id: "challenges",
                name: "challenges",
                description:
                    "Community photography challenges."
            }
        ]
    }

];


/* =========================================================
   DEFAULT EVENTS
========================================================= */

const defaultEvents = [

    {
        id: "event-basketball-1",
        communityId: "basketball",
        title: "After-school Basketball Game",
        day: "26",
        month: "SEP",
        time: "4:00 PM",
        location: "School Gym"
    },

    {
        id: "event-fencing-1",
        communityId: "fencing",
        title: "Team Training",
        day: "29",
        month: "SEP",
        time: "5:00 PM",
        location: "Sports Hall"
    },

    {
        id: "event-coding-1",
        communityId: "coding",
        title: "Project Workshop",
        day: "30",
        month: "SEP",
        time: "3:45 PM",
        location: "Computer Lab"
    },

    {
        id: "event-math-1",
        communityId: "math",
        title: "AMC Practice Session",
        day: "02",
        month: "OCT",
        time: "After school",
        location: "Room 204"
    },

    {
        id: "event-music-1",
        communityId: "music",
        title: "Open Rehearsal",
        day: "04",
        month: "OCT",
        time: "4:30 PM",
        location: "Music Room"
    },

    {
        id: "event-art-1",
        communityId: "art",
        title: "Sketching Meetup",
        day: "07",
        month: "OCT",
        time: "3:40 PM",
        location: "Art Room"
    }

];


/* =========================================================
   DEFAULT ACTIVITY
========================================================= */

const defaultNotifications = [

    {
        icon: "🏀",
        title: "Basketball has a new event",
        description:
            "After-school Basketball Game is scheduled for Sep 26.",
        time: "Recently"
    },

    {
        icon: "💬",
        title: "New reply in Coding",
        description:
            "Jason replied to a project discussion.",
        time: "1 hour ago"
    },

    {
        icon: "🎵",
        title: "Music event announced",
        description:
            "Open Rehearsal has been added to school events.",
        time: "Today"
    }

];


const defaultMentions = [

    {
        icon: "@",
        title: "Demo mention",
        description:
            "When another student mentions you in a post, it will appear here.",
        time: "Prototype"
    }

];


/* =========================================================
   APP STATE
========================================================= */

let communities =
    structuredClone(
        defaultCommunities
    );


let joinedCommunities = [];


let posts = [];


let activeCommunityId = null;

let activeChannelId = "general";

let activeCategory = "ALL";


/* =========================================================
   APP ELEMENTS
========================================================= */

const mainApp =
    document.getElementById(
        "mainApp"
    );

const appPages =
    document.querySelectorAll(
        ".app-page"
    );

const sidebarLinks =
    document.querySelectorAll(
        ".sidebar-link"
    );

const sidebarSecondaryPageLinks =
    document.querySelectorAll(
        ".sidebar-secondary-link[data-page]"
    );


const homeButton =
    document.getElementById(
        "homeButton"
    );

const discoverButton =
    document.getElementById(
        "discoverButton"
    );

const createCommunityButton =
    document.getElementById(
        "createCommunityButton"
    );

const createCommunityHeaderButton =
    document.getElementById(
        "createCommunityHeaderButton"
    );


const joinedCommunityIcons =
    document.getElementById(
        "joinedCommunityIcons"
    );


const homeSidebar =
    document.getElementById(
        "homeSidebar"
    );

const communitySidebar =
    document.getElementById(
        "communitySidebar"
    );

const sidebarCommunityIcon =
    document.getElementById(
        "sidebarCommunityIcon"
    );

const sidebarCommunityName =
    document.getElementById(
        "sidebarCommunityName"
    );

const communityChannelList =
    document.getElementById(
        "communityChannelList"
    );


const communityGrid =
    document.getElementById(
        "communityGrid"
    );

const communitySearch =
    document.getElementById(
        "communitySearch"
    );

const categoryFilters =
    document.querySelectorAll(
        ".category-filter"
    );


const homeContent =
    document.getElementById(
        "homeContent"
    );


const globalEventsList =
    document.getElementById(
        "globalEventsList"
    );


const notificationList =
    document.getElementById(
        "notificationList"
    );

const mentionList =
    document.getElementById(
        "mentionList"
    );


const communityPageIcon =
    document.getElementById(
        "communityPageIcon"
    );

const communityPageName =
    document.getElementById(
        "communityPageName"
    );

const communityPageDescription =
    document.getElementById(
        "communityPageDescription"
    );

const communityMemberCount =
    document.getElementById(
        "communityMemberCount"
    );

const communityCategory =
    document.getElementById(
        "communityCategory"
    );


const channelView =
    document.getElementById(
        "channelView"
    );

const communityEventsView =
    document.getElementById(
        "communityEventsView"
    );

const communityAboutView =
    document.getElementById(
        "communityAboutView"
    );


const channelTitle =
    document.getElementById(
        "channelTitle"
    );

const channelDescription =
    document.getElementById(
        "channelDescription"
    );

const composerChannelLabel =
    document.getElementById(
        "composerChannelLabel"
    );

const postInput =
    document.getElementById(
        "postInput"
    );

const publishPostButton =
    document.getElementById(
        "publishPostButton"
    );

const communityPostFeed =
    document.getElementById(
        "communityPostFeed"
    );


const communityEventsButton =
    document.getElementById(
        "communityEventsButton"
    );

const communityAboutButton =
    document.getElementById(
        "communityAboutButton"
    );

const leaveCommunityButton =
    document.getElementById(
        "leaveCommunityButton"
    );

const communityEventsTitle =
    document.getElementById(
        "communityEventsTitle"
    );

const communityEventsDescription =
    document.getElementById(
        "communityEventsDescription"
    );

const communityEventsList =
    document.getElementById(
        "communityEventsList"
    );


const communityAboutTitle =
    document.getElementById(
        "communityAboutTitle"
    );

const communityAboutDescription =
    document.getElementById(
        "communityAboutDescription"
    );

const communityAboutMembers =
    document.getElementById(
        "communityAboutMembers"
    );

const communityAboutCategory =
    document.getElementById(
        "communityAboutCategory"
    );

const communityAboutChannels =
    document.getElementById(
        "communityAboutChannels"
    );


/* =========================================================
   MODAL ELEMENTS
========================================================= */

const createCommunityModal =
    document.getElementById(
        "createCommunityModal"
    );

const closeCreateCommunityModal =
    document.getElementById(
        "closeCreateCommunityModal"
    );

const createCommunityForm =
    document.getElementById(
        "createCommunityForm"
    );

const newCommunityName =
    document.getElementById(
        "newCommunityName"
    );

const newCommunityIcon =
    document.getElementById(
        "newCommunityIcon"
    );

const newCommunityCategory =
    document.getElementById(
        "newCommunityCategory"
    );

const newCommunityDescription =
    document.getElementById(
        "newCommunityDescription"
    );


const sidebarUserAvatar =
    document.getElementById(
        "sidebarUserAvatar"
    );

const sidebarUserName =
    document.getElementById(
        "sidebarUserName"
    );

const sidebarUserRole =
    document.getElementById(
        "sidebarUserRole"
    );


const settingsButton =
    document.getElementById(
        "settingsButton"
    );

const settingsModal =
    document.getElementById(
        "settingsModal"
    );

const closeSettingsModal =
    document.getElementById(
        "closeSettingsModal"
    );

const refreshSharedDataButton =
    document.getElementById(
        "refreshSharedDataButton"
    );

const appearanceMode =
    document.getElementById(
        "appearanceMode"
    );

const compactModeToggle =
    document.getElementById(
        "compactModeToggle"
    );

const notificationBadgeToggle =
    document.getElementById(
        "notificationBadgeToggle"
    );

const resetPreferencesButton =
    document.getElementById(
        "resetPreferencesButton"
    );

const developerSettingsSection =
    document.getElementById(
        "developerSettingsSection"
    );

const settingsDeveloperBadge =
    document.getElementById(
        "settingsDeveloperBadge"
    );


/* =========================================================
   COMMUNITY HELPERS
========================================================= */

function getCommunity(
    communityId
) {

    return communities.find(
        community =>
            community.id ===
            communityId
    );
}


function getActiveCommunity() {

    return getCommunity(
        activeCommunityId
    );
}


function getChannel(
    community,
    channelId
) {

    if (!community) {
        return null;
    }

    return community.channels.find(
        channel =>
            channel.id ===
            channelId
    );
}


/* =========================================================
   APP PAGE NAVIGATION
========================================================= */

function showAppPage(
    pageName
) {

    appPages.forEach(
        page => {

            page.classList.remove(
                "active"
            );
        }
    );


    const page =
        document.getElementById(
            `${pageName}Page`
        );


    if (page) {

        page.classList.add(
            "active"
        );
    }


    sidebarLinks.forEach(
        link => {

            link.classList.toggle(
                "active",
                link.dataset.page ===
                    pageName
            );
        }
    );


    if (
        pageName === "home" ||
        pageName === "discover" ||
        pageName === "events" ||
        pageName === "notifications" ||
        pageName === "mentions"
    ) {

        showHomeSidebar();
    }


    if (pageName === "home") {
        renderHome();
    }

    if (pageName === "discover") {
        renderCommunities();
    }

    if (pageName === "events") {
        renderGlobalEvents();
    }

    if (pageName === "notifications") {
        renderNotifications();
    }

    if (pageName === "mentions") {
        renderMentions();
    }
}


/* =========================================================
   SIDEBAR MODES
========================================================= */

function showHomeSidebar() {

    if (homeSidebar) {
        homeSidebar.classList.add(
            "active"
        );
    }

    if (communitySidebar) {
        communitySidebar.classList.remove(
            "active"
        );
    }

    if (homeButton) {
        homeButton.classList.add(
            "active"
        );
    }
}


function showCommunitySidebar(
    community
) {

    if (!community) {
        return;
    }

    if (homeSidebar) {
        homeSidebar.classList.remove(
            "active"
        );
    }

    if (communitySidebar) {
        communitySidebar.classList.add(
            "active"
        );
    }

    if (homeButton) {
        homeButton.classList.remove(
            "active"
        );
    }


    if (sidebarCommunityIcon) {
        sidebarCommunityIcon.textContent =
            community.icon;
    }

    if (sidebarCommunityName) {
        sidebarCommunityName.textContent =
            community.name;
    }


    renderCommunityChannels(
        community
    );
}


/* =========================================================
   LEFT COMMUNITY RAIL
========================================================= */

function renderJoinedCommunities() {

    if (!joinedCommunityIcons) {
        return;
    }

    joinedCommunityIcons.innerHTML =
        "";


    joinedCommunities.forEach(
        communityId => {

            const community =
                getCommunity(
                    communityId
                );

            if (!community) {
                return;
            }


            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "community-rail-icon";

            button.textContent =
                community.icon;

            button.title =
                community.name;

            button.dataset.community =
                community.id;


            if (
                community.id ===
                activeCommunityId
            ) {

                button.classList.add(
                    "active"
                );
            }


            button.addEventListener(
                "click",
                () => {

                    openCommunity(
                        community.id
                    );
                }
            );


            joinedCommunityIcons.appendChild(
                button
            );
        }
    );
}


/* =========================================================
   DISCOVER
========================================================= */

function renderCommunities() {

    if (!communityGrid) {
        return;
    }

    communityGrid.innerHTML =
        "";


    const search =
        communitySearch
            ? communitySearch.value
                .toLowerCase()
                .trim()
            : "";


    const filtered =
        communities.filter(
            community => {

                const matchesSearch =
                    community.name
                        .toLowerCase()
                        .includes(search) ||

                    community.description
                        .toLowerCase()
                        .includes(search) ||

                    community.category
                        .toLowerCase()
                        .includes(search);


                const matchesCategory =
                    activeCategory ===
                        "ALL" ||

                    community.category ===
                        activeCategory;


                return (
                    matchesSearch &&
                    matchesCategory
                );
            }
        );


    if (filtered.length === 0) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "empty-content-card";

        empty.textContent =
            "No communities match your search.";

        communityGrid.appendChild(
            empty
        );

        return;
    }


    filtered.forEach(
        community => {

            const joined =
                joinedCommunities.includes(
                    community.id
                );


            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "community-card";


            const icon =
                document.createElement(
                    "div"
                );

            icon.className =
                "community-card-icon";

            icon.textContent =
                community.icon;


            const name =
                document.createElement(
                    "h3"
                );

            name.textContent =
                community.name;


            const description =
                document.createElement(
                    "p"
                );

            description.className =
                "community-card-description";

            description.textContent =
                community.description;


            const meta =
                document.createElement(
                    "div"
                );

            meta.className =
                "community-card-meta";


            const category =
                document.createElement(
                    "span"
                );

            category.className =
                "community-card-category";

            category.textContent =
                community.category;


            const members =
                document.createElement(
                    "span"
                );

            members.textContent =
                `${community.members} members`;


            meta.appendChild(
                category
            );

            meta.appendChild(
                members
            );


            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                joined
                    ? "join-community-btn joined"
                    : "join-community-btn";

            button.textContent =
                joined
                    ? "Joined ✓"
                    : "Join Community";


            button.addEventListener(
                "click",
                () => {

                    if (joined) {

                        openCommunity(
                            community.id
                        );

                    } else {

                        joinCommunity(
                            community.id
                        );
                    }
                }
            );


            card.appendChild(icon);
            card.appendChild(name);
            card.appendChild(description);
            card.appendChild(meta);
            card.appendChild(button);

            communityGrid.appendChild(
                card
            );
        }
    );
}


/* =========================================================
   JOIN COMMUNITY
========================================================= */

async function joinCommunity(
    communityId
) {

    if (
        joinedCommunities.includes(
            communityId
        )
    ) {
        return;
    }

    const community =
        communities.find(
            item => item.id === communityId
        );

    // Optimistic UI: the click feels instant. Firestore is still the source
    // of truth; if the write fails, we roll this local change back.
    joinedCommunities = [
        ...joinedCommunities,
        communityId
    ];

    if (community) {
        community.members =
            Math.max(
                0,
                Number(community.members) || 0
            ) + 1;
    }

    renderAllAppContent();
    openCommunity(
        communityId
    );

    try {
        const confirmedMemberCount =
            await window.HCFirebaseData.joinCommunity(
                communityId
            );

        if (
            community &&
            Number.isFinite(
                Number(confirmedMemberCount)
            )
        ) {
            community.members =
                Number(confirmedMemberCount);

            renderAllAppContent();
        }

    } catch (error) {
        joinedCommunities =
            joinedCommunities.filter(
                id => id !== communityId
            );

        if (community) {
            community.members =
                Math.max(
                    0,
                    (Number(community.members) || 1) - 1
                );
        }

        renderAllAppContent();

        console.error(
            "Could not join community:",
            error
        );

        window.alert(
            error?.message ||
            "Could not join this community."
        );
    }
}


/* =========================================================
   LEAVE COMMUNITY
========================================================= */

async function leaveActiveCommunity() {

    if (!activeCommunityId) {
        return;
    }

    const community =
        getActiveCommunity();

    if (!community) {
        return;
    }

    const confirmed =
        window.confirm(
            `Leave ${community.name}?`
        );

    if (!confirmed) {
        return;
    }

    try {
        await window.HCFirebaseData.leaveCommunity(
            activeCommunityId
        );

        activeCommunityId =
            null;

        activeChannelId =
            "general";

        await refreshFirestoreCommunityState();

        showAppPage(
            "home"
        );

    } catch (error) {
        console.error(
            "Could not leave community:",
            error
        );

        window.alert(
            error?.message ||
            "Could not leave this community."
        );
    }
}


/* =========================================================
   OPEN COMMUNITY
========================================================= */

function openCommunity(
    communityId
) {

    if (
        !joinedCommunities.includes(
            communityId
        )
    ) {
        return;
    }


    const community =
        getCommunity(
            communityId
        );

    if (!community) {
        return;
    }


    activeCommunityId =
        community.id;

    activeChannelId =
        community.channels[0]
            ? community.channels[0].id
            : "general";


    if (communityPageIcon) {
        communityPageIcon.textContent =
            community.icon;
    }

    if (communityPageName) {
        communityPageName.textContent =
            community.name;
    }

    if (communityPageDescription) {
        communityPageDescription.textContent =
            community.description;
    }

    if (communityMemberCount) {
        communityMemberCount.textContent =
            `${community.members} members`;
    }

    if (communityCategory) {
        communityCategory.textContent =
            community.category;
    }


    showAppPage(
        "community"
    );

    showCommunitySidebar(
        community
    );

    showCommunityView(
        "channel"
    );

    openChannel(
        activeChannelId
    );

    renderJoinedCommunities();
}


/* =========================================================
   COMMUNITY CHANNELS
========================================================= */

function renderCommunityChannels(
    community
) {

    if (
        !communityChannelList ||
        !community
    ) {
        return;
    }


    communityChannelList.innerHTML =
        "";


    community.channels.forEach(
        channel => {

            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "channel-link";

            button.dataset.channel =
                channel.id;


            const hash =
                document.createElement(
                    "span"
                );

            hash.textContent =
                "#";


            const name =
                document.createTextNode(
                    channel.name
                );


            button.appendChild(
                hash
            );

            button.appendChild(
                name
            );


            if (
                channel.id ===
                activeChannelId
            ) {

                button.classList.add(
                    "active"
                );
            }


            button.addEventListener(
                "click",
                () => {

                    openChannel(
                        channel.id
                    );
                }
            );


            communityChannelList.appendChild(
                button
            );
        }
    );
}


/* =========================================================
   OPEN CHANNEL
========================================================= */

function openChannel(
    channelId
) {

    const community =
        getActiveCommunity();

    if (!community) {
        return;
    }


    const channel =
        getChannel(
            community,
            channelId
        );

    if (!channel) {
        return;
    }


    activeChannelId =
        channel.id;


    showCommunityView(
        "channel"
    );


    if (channelTitle) {
        channelTitle.textContent =
            `# ${channel.name}`;
    }

    if (channelDescription) {
        channelDescription.textContent =
            channel.description;
    }

    if (composerChannelLabel) {
        composerChannelLabel.textContent =
            `Posting in #${channel.name}`;
    }

    if (postInput) {
        postInput.placeholder =
            `Share something in #${channel.name}...`;
    }


    renderCommunityChannels(
        community
    );

    renderCommunityPosts();
}


/* =========================================================
   COMMUNITY VIEWS
========================================================= */

function showCommunityView(
    viewName
) {

    [
        channelView,
        communityEventsView,
        communityAboutView
    ].forEach(
        view => {

            if (view) {
                view.classList.remove(
                    "active"
                );
            }
        }
    );


    if (
        viewName === "channel" &&
        channelView
    ) {

        channelView.classList.add(
            "active"
        );
    }


    if (
        viewName === "events" &&
        communityEventsView
    ) {

        communityEventsView.classList.add(
            "active"
        );
    }


    if (
        viewName === "about" &&
        communityAboutView
    ) {

        communityAboutView.classList.add(
            "active"
        );
    }
}


/* =========================================================
   POSTS
========================================================= */

function renderCommunityPosts() {

    if (!communityPostFeed) {
        return;
    }


    communityPostFeed.innerHTML =
        "";


    const filtered =
        posts
            .filter(
                post =>
                    post.communityId ===
                        activeCommunityId &&

                    post.channelId ===
                        activeChannelId
            )
            .sort(
                (a, b) =>
                    b.timestamp -
                    a.timestamp
            );


    if (filtered.length === 0) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "empty-content-card";

        empty.textContent =
            "No posts here yet. Start the conversation.";

        communityPostFeed.appendChild(
            empty
        );

        return;
    }


    filtered.forEach(
        post => {

            communityPostFeed.appendChild(
                createPostElement(
                    post,
                    false
                )
            );
        }
    );
}


/* =========================================================
   CREATE POST ELEMENT
========================================================= */

function createPostElement(
    post,
    showCommunityChip = false
) {

    const community =
        getCommunity(
            post.communityId
        );


    const card =
        document.createElement(
            "article"
        );

    card.className =
        "post-card";


    const header =
        document.createElement(
            "div"
        );

    header.className =
        "post-card-header";


    const avatar =
        document.createElement(
            "div"
        );

    avatar.className =
        "post-avatar";

    avatar.textContent =
        post.avatar ||
        post.author
            .charAt(0)
            .toUpperCase();


    const authorInfo =
        document.createElement(
            "div"
        );

    authorInfo.className =
        "post-author-info";


    const author =
        document.createElement(
            "strong"
        );

    author.textContent =
        post.author;


    const meta =
        document.createElement(
            "span"
        );

    meta.textContent =
        `${formatTime(post.timestamp)} · #${post.channelId}`;


    authorInfo.appendChild(
        author
    );

    if (
        window.HCFirebaseData?.isDeveloperUid?.(
            post.authorId
        )
    ) {
        const developerBadge =
            document.createElement(
                "span"
            );

        developerBadge.className =
            "developer-badge inline-developer-badge";

        developerBadge.textContent =
            "DEV";

        authorInfo.appendChild(
            developerBadge
        );
    }

    authorInfo.appendChild(
        meta
    );


    header.appendChild(
        avatar
    );

    header.appendChild(
        authorInfo
    );


    if (
        showCommunityChip &&
        community
    ) {

        const chip =
            document.createElement(
                "span"
            );

        chip.className =
            "post-community-chip";

        chip.textContent =
            `${community.icon} ${community.name}`;

        header.appendChild(
            chip
        );
    }


    const body =
        document.createElement(
            "p"
        );

    body.className =
        "post-body";

    body.textContent =
        post.content;


    const actions =
        document.createElement(
            "div"
        );

    actions.className =
        "post-actions";


    const likeButton =
        document.createElement(
            "button"
        );

    likeButton.type =
        "button";

    likeButton.className =
        post.liked
            ? "post-action-button liked"
            : "post-action-button";

    likeButton.textContent =
        `♡ ${post.likes}`;


    likeButton.addEventListener(
        "click",
        () => {

            togglePostLike(
                post.id
            );
        }
    );


    const replyButton =
        document.createElement(
            "button"
        );

    replyButton.type =
        "button";

    replyButton.className =
        "post-action-button";

    replyButton.textContent =
        `💬 ${post.replies.length}`;


    actions.appendChild(
        likeButton
    );

    actions.appendChild(
        replyButton
    );


    if (
        post.authorId &&
        (
            post.authorId ===
                window.HCFirebaseData?.getCurrentUserId?.()
            || window.HCFirebaseData?.isDeveloper?.()
        )
    ) {

        const deleteButton =
            document.createElement(
                "button"
            );

        deleteButton.type =
            "button";

        deleteButton.className =
            "post-action-button post-delete-button";

        deleteButton.textContent =
            "Delete";


        deleteButton.addEventListener(
            "click",
            () => {

                deletePost(
                    post.id
                );
            }
        );


        actions.appendChild(
            deleteButton
        );
    }


    const replySection =
        document.createElement(
            "div"
        );

    replySection.className =
        "reply-section";


    const replyList =
        document.createElement(
            "div"
        );

    replyList.className =
        "reply-list";


    post.replies.forEach(
        reply => {

            const replyItem =
                document.createElement(
                    "div"
                );

            replyItem.className =
                "reply-item";


            const replyAuthor =
                document.createElement(
                    "strong"
                );

            replyAuthor.textContent =
                reply.author;


            const replyTime =
                document.createElement(
                    "span"
                );

            replyTime.textContent =
                formatTime(
                    reply.timestamp
                );


            const replyContent =
                document.createElement(
                    "p"
                );

            replyContent.textContent =
                reply.content;


            replyItem.appendChild(
                replyAuthor
            );

            replyItem.appendChild(
                replyTime
            );

            replyItem.appendChild(
                replyContent
            );

            if (
                window.HCFirebaseData?.isDeveloperUid?.(
                    reply.authorId
                )
            ) {
                const replyDeveloperBadge =
                    document.createElement(
                        "span"
                    );

                replyDeveloperBadge.className =
                    "developer-badge reply-developer-badge";

                replyDeveloperBadge.textContent =
                    "DEV";

                replyItem.appendChild(
                    replyDeveloperBadge
                );
            }

            if (
                window.HCFirebaseData?.isDeveloper?.()
            ) {
                const deleteReplyButton =
                    document.createElement(
                        "button"
                    );

                deleteReplyButton.type =
                    "button";

                deleteReplyButton.className =
                    "reply-delete-button";

                deleteReplyButton.textContent =
                    "Remove";

                deleteReplyButton.addEventListener(
                    "click",
                    () => {
                        deleteReply(
                            post.id,
                            reply.id
                        );
                    }
                );

                replyItem.appendChild(
                    deleteReplyButton
                );
            }


            replyList.appendChild(
                replyItem
            );
        }
    );


    const replyComposer =
        document.createElement(
            "div"
        );

    replyComposer.className =
        "reply-composer";


    const replyInput =
        document.createElement(
            "input"
        );

    replyInput.type =
        "text";

    replyInput.maxLength =
        300;

    replyInput.placeholder =
        "Write a reply...";


    const sendReply =
        document.createElement(
            "button"
        );

    sendReply.type =
        "button";

    sendReply.textContent =
        "Reply";


    const submitReply =
        () => {

            const content =
                replyInput.value.trim();

            if (!content) {
                return;
            }

            addReply(
                post.id,
                content
            );
        };


    sendReply.addEventListener(
        "click",
        submitReply
    );


    replyInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                submitReply();
            }
        }
    );


    replyComposer.appendChild(
        replyInput
    );

    replyComposer.appendChild(
        sendReply
    );


    replySection.appendChild(
        replyList
    );

    replySection.appendChild(
        replyComposer
    );


    card.appendChild(
        header
    );

    card.appendChild(
        body
    );

    card.appendChild(
        actions
    );

    card.appendChild(
        replySection
    );


    return card;
}


/* =========================================================
   PUBLISH POST
========================================================= */

async function publishPost() {

    if (
        !postInput ||
        !activeCommunityId ||
        !activeChannelId
    ) {
        return;
    }

    const content =
        postInput.value.trim();

    if (!content) {
        postInput.focus();
        return;
    }

    postInput.disabled = true;

    try {
        await window.HCFirebaseData.createPost({
            communityId: activeCommunityId,
            channelId: activeChannelId,
            content
        });

        postInput.value = "";
        await refreshFirestorePosts();

    } catch (error) {
        console.error(
            "Could not publish post:",
            error
        );

        window.alert(
            error?.message ||
            "Could not publish this post."
        );

    } finally {
        postInput.disabled = false;
        postInput.focus();
    }
}


/* =========================================================
   LIKE POST
========================================================= */

async function togglePostLike(
    postId
) {

    try {
        await window.HCFirebaseData.togglePostLike(
            postId
        );

        await refreshFirestorePosts();

    } catch (error) {
        console.error(
            "Could not update like:",
            error
        );

        window.alert(
            error?.message ||
            "Could not update this like."
        );
    }
}


/* =========================================================
   ADD REPLY
========================================================= */

async function addReply(
    postId,
    content
) {

    try {
        await window.HCFirebaseData.addReply(
            postId,
            content
        );

        await refreshFirestorePosts();

    } catch (error) {
        console.error(
            "Could not add reply:",
            error
        );

        window.alert(
            error?.message ||
            "Could not add this reply."
        );
    }
}


/* =========================================================
   DEVELOPER REPLY MODERATION
========================================================= */

async function deleteReply(
    postId,
    replyId
) {

    if (
        !window.HCFirebaseData?.isDeveloper?.()
    ) {
        return;
    }

    const confirmed =
        window.confirm(
            "Remove this reply as developer?"
        );

    if (!confirmed) {
        return;
    }

    try {
        await window.HCFirebaseData.deleteReply(
            postId,
            replyId
        );

        await refreshFirestorePosts();

    } catch (error) {
        console.error(
            "Could not remove reply:",
            error
        );

        window.alert(
            error?.message ||
            "Could not remove this reply."
        );
    }
}


/* =========================================================
   DELETE POST / DEVELOPER MODERATION
========================================================= */

async function deletePost(
    postId
) {

    const post =
        posts.find(
            item =>
                item.id ===
                postId
        );

    const currentUserId =
        window.HCFirebaseData?.getCurrentUserId?.();

    const isDeveloper =
        window.HCFirebaseData?.isDeveloper?.() === true;

    if (
        !post ||
        !currentUserId ||
        (
            post.authorId !== currentUserId &&
            !isDeveloper
        )
    ) {
        return;
    }

    const confirmed =
        window.confirm(
            isDeveloper && post.authorId !== currentUserId
                ? "Remove this post as developer?"
                : "Delete this post?"
        );

    if (!confirmed) {
        return;
    }

    try {
        await window.HCFirebaseData.deletePost(
            postId
        );

        await refreshFirestorePosts();

    } catch (error) {
        console.error(
            "Could not delete post:",
            error
        );

        window.alert(
            error?.message ||
            "Could not delete this post."
        );
    }
}


/* =========================================================
   HOME FEED
========================================================= */

function renderHome() {

    if (!homeContent) {
        return;
    }


    homeContent.innerHTML =
        "";


    if (
        joinedCommunities.length === 0
    ) {

        const state =
            document.createElement(
                "div"
            );

        state.className =
            "home-empty-state";


        const icon =
            document.createElement(
                "div"
            );

        icon.className =
            "home-empty-icon";

        icon.textContent =
            "◎";


        const heading =
            document.createElement(
                "h2"
            );

        heading.textContent =
            "Find your people.";


        const text =
            document.createElement(
                "p"
            );

        text.textContent =
            "You haven't joined any communities yet. Explore sports, academics, creative groups, technology and more around school.";


        const button =
            document.createElement(
                "button"
            );

        button.type =
            "button";

        button.className =
            "primary-app-btn";

        button.textContent =
            "Discover Communities";


        button.addEventListener(
            "click",
            () => {

                showAppPage(
                    "discover"
                );
            }
        );


        state.appendChild(icon);
        state.appendChild(heading);
        state.appendChild(text);
        state.appendChild(button);

        homeContent.appendChild(
            state
        );

        return;
    }


    const feed =
        document.createElement(
            "div"
        );

    feed.className =
        "home-feed";


    const heading =
        document.createElement(
            "div"
        );

    heading.className =
        "home-feed-heading";


    const title =
        document.createElement(
            "h2"
        );

    title.textContent =
        "Latest from your communities";


    const count =
        document.createElement(
            "span"
        );

    count.textContent =
        `${joinedCommunities.length} joined`;


    heading.appendChild(
        title
    );

    heading.appendChild(
        count
    );


    feed.appendChild(
        heading
    );


    const homePosts =
        posts
            .filter(
                post =>
                    joinedCommunities.includes(
                        post.communityId
                    )
            )
            .sort(
                (a, b) =>
                    b.timestamp -
                    a.timestamp
            )
            .slice(
                0,
                20
            );


    if (
        homePosts.length === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "empty-content-card";

        empty.textContent =
            "Your communities don't have any posts yet.";

        feed.appendChild(
            empty
        );

    } else {

        homePosts.forEach(
            post => {

                feed.appendChild(
                    createPostElement(
                        post,
                        true
                    )
                );
            }
        );
    }


    homeContent.appendChild(
        feed
    );
}


/* =========================================================
   EVENTS
========================================================= */

function createEventElement(
    event
) {

    const community =
        getCommunity(
            event.communityId
        );


    const card =
        document.createElement(
            "article"
        );

    card.className =
        "app-event-card";


    const date =
        document.createElement(
            "div"
        );

    date.className =
        "app-event-date";


    const day =
        document.createElement(
            "strong"
        );

    day.textContent =
        event.day;


    const month =
        document.createElement(
            "span"
        );

    month.textContent =
        event.month;


    date.appendChild(
        day
    );

    date.appendChild(
        month
    );


    const info =
        document.createElement(
            "div"
        );

    info.className =
        "app-event-info";


    const communityName =
        document.createElement(
            "span"
        );

    communityName.className =
        "app-event-community";

    communityName.textContent =
        community
            ? `${community.icon} ${community.name}`
            : "COMMUNITY";


    const title =
        document.createElement(
            "h3"
        );

    title.textContent =
        event.title;


    const time =
        document.createElement(
            "p"
        );

    time.textContent =
        event.time;


    info.appendChild(
        communityName
    );

    info.appendChild(
        title
    );

    info.appendChild(
        time
    );


    const location =
        document.createElement(
            "span"
        );

    location.className =
        "app-event-location";

    location.textContent =
        event.location;


    card.appendChild(
        date
    );

    card.appendChild(
        info
    );

    card.appendChild(
        location
    );


    return card;
}


/* =========================================================
   GLOBAL EVENTS
========================================================= */

function renderGlobalEvents() {

    if (!globalEventsList) {
        return;
    }


    globalEventsList.innerHTML =
        "";


    if (defaultEvents.length === 0) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "empty-content-card";

        empty.textContent =
            "No school events have been announced yet.";

        globalEventsList.appendChild(
            empty
        );

        return;
    }


    defaultEvents.forEach(
        event => {

            globalEventsList.appendChild(
                createEventElement(
                    event
                )
            );
        }
    );
}


/* =========================================================
   COMMUNITY EVENTS
========================================================= */

function openCommunityEvents() {

    const community =
        getActiveCommunity();

    if (!community) {
        return;
    }


    showCommunityView(
        "events"
    );


    if (communityEventsTitle) {
        communityEventsTitle.textContent =
            `${community.name} Events`;
    }

    if (communityEventsDescription) {
        communityEventsDescription.textContent =
            `Events from ${community.name} only.`;
    }


    renderCommunityEvents();
}


function renderCommunityEvents() {

    if (!communityEventsList) {
        return;
    }


    communityEventsList.innerHTML =
        "";


    const events =
        defaultEvents.filter(
            event =>
                event.communityId ===
                activeCommunityId
        );


    if (events.length === 0) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "empty-content-card";

        empty.textContent =
            "This community doesn't have any upcoming events yet.";

        communityEventsList.appendChild(
            empty
        );

        return;
    }


    events.forEach(
        event => {

            communityEventsList.appendChild(
                createEventElement(
                    event
                )
            );
        }
    );
}


/* =========================================================
   COMMUNITY ABOUT
========================================================= */

function openCommunityAbout() {

    const community =
        getActiveCommunity();

    if (!community) {
        return;
    }


    showCommunityView(
        "about"
    );


    if (communityAboutTitle) {
        communityAboutTitle.textContent =
            community.name;
    }

    if (communityAboutDescription) {
        communityAboutDescription.textContent =
            community.description;
    }

    if (communityAboutMembers) {
        communityAboutMembers.textContent =
            String(
                community.members
            );
    }

    if (communityAboutCategory) {
        communityAboutCategory.textContent =
            community.category;
    }

    if (communityAboutChannels) {
        communityAboutChannels.textContent =
            String(
                community.channels.length
            );
    }
}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function renderNotifications() {

    if (!notificationList) {
        return;
    }


    notificationList.innerHTML =
        "";


    defaultNotifications.forEach(
        notification => {

            notificationList.appendChild(
                createActivityElement(
                    notification
                )
            );
        }
    );
}


function renderMentions() {

    if (!mentionList) {
        return;
    }


    mentionList.innerHTML =
        "";


    defaultMentions.forEach(
        mention => {

            mentionList.appendChild(
                createActivityElement(
                    mention
                )
            );
        }
    );
}


function createActivityElement(
    activity
) {

    const card =
        document.createElement(
            "article"
        );

    card.className =
        "activity-card";


    const icon =
        document.createElement(
            "div"
        );

    icon.className =
        "activity-icon";

    icon.textContent =
        activity.icon;


    const content =
        document.createElement(
            "div"
        );


    const title =
        document.createElement(
            "strong"
        );

    title.textContent =
        activity.title;


    const description =
        document.createElement(
            "p"
        );

    description.textContent =
        activity.description;


    const time =
        document.createElement(
            "small"
        );

    time.textContent =
        activity.time;


    content.appendChild(
        title
    );

    content.appendChild(
        description
    );

    content.appendChild(
        time
    );


    card.appendChild(
        icon
    );

    card.appendChild(
        content
    );


    return card;
}


/* =========================================================
   CREATE COMMUNITY
========================================================= */

function openCreateCommunityModal() {

    if (!createCommunityModal) {
        return;
    }

    createCommunityModal.classList.remove(
        "hidden"
    );


    if (newCommunityName) {
        newCommunityName.focus();
    }
}


function closeCommunityModal() {

    if (!createCommunityModal) {
        return;
    }

    createCommunityModal.classList.add(
        "hidden"
    );
}


async function createCommunity(
    event
) {

    event.preventDefault();

    const name =
        newCommunityName
            ? newCommunityName.value.trim()
            : "";

    const icon =
        newCommunityIcon
            ? newCommunityIcon.value.trim()
            : "";

    const category =
        newCommunityCategory
            ? newCommunityCategory.value
            : "OTHER";

    const description =
        newCommunityDescription
            ? newCommunityDescription.value.trim()
            : "";

    if (
        !name ||
        !icon ||
        !description
    ) {
        return;
    }

    const submitButton =
        createCommunityForm?.querySelector(
            'button[type="submit"]'
        );

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent =
            "Creating…";
    }

    try {
        const communityId =
            await window.HCFirebaseData.createCommunity({
                name,
                icon,
                category,
                description
            });

        if (createCommunityForm) {
            createCommunityForm.reset();
        }

        closeCommunityModal();

        await refreshFirestoreCommunityState();

        openCommunity(
            communityId
        );

    } catch (error) {
        console.error(
            "Could not create community:",
            error
        );

        window.alert(
            error?.message ||
            "Could not create the community."
        );

    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent =
                "Create Community";
        }
    }
}


/* =========================================================
   DEVICE PREFERENCES
========================================================= */

const HC_PREFERENCES_KEY =
    "hc_device_preferences";

const DEFAULT_HC_PREFERENCES = {
    theme: "apple",
    compact: false,
    notificationBadges: true
};


function loadDevicePreferences() {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    HC_PREFERENCES_KEY
                ) || "{}"
            );

        return {
            ...DEFAULT_HC_PREFERENCES,
            ...saved
        };

    } catch (error) {

        console.warn(
            "Could not read device preferences:",
            error
        );

        return {
            ...DEFAULT_HC_PREFERENCES
        };
    }
}


let devicePreferences =
    loadDevicePreferences();


function saveDevicePreferences() {

    localStorage.setItem(
        HC_PREFERENCES_KEY,
        JSON.stringify(
            devicePreferences
        )
    );
}


function applyDevicePreferences() {

    const allowedThemes =
        new Set([
            "apple",
            "midnight",
            "soft"
        ]);

    // Older builds stored the original dark theme as "default".
    // In this test build, that preference upgrades to the new Apple Glass look.
    if (devicePreferences.theme === "default") {
        devicePreferences.theme =
            "apple";
    }

    if (
        !allowedThemes.has(
            devicePreferences.theme
        )
    ) {
        devicePreferences.theme =
            "apple";
    }

    document.body.dataset.hcTheme =
        devicePreferences.theme;

    document.body.classList.toggle(
        "hc-compact",
        Boolean(
            devicePreferences.compact
        )
    );

    document.body.classList.toggle(
        "hc-hide-notification-badges",
        !devicePreferences.notificationBadges
    );

    if (appearanceMode) {
        appearanceMode.value =
            devicePreferences.theme;
    }

    if (compactModeToggle) {
        compactModeToggle.checked =
            Boolean(
                devicePreferences.compact
            );
    }

    if (notificationBadgeToggle) {
        notificationBadgeToggle.checked =
            Boolean(
                devicePreferences.notificationBadges
            );
    }
}


function updateDevicePreference(
    key,
    value
) {

    devicePreferences = {
        ...devicePreferences,
        [key]: value
    };

    saveDevicePreferences();
    applyDevicePreferences();
}


function resetDevicePreferences() {

    devicePreferences = {
        ...DEFAULT_HC_PREFERENCES
    };

    saveDevicePreferences();
    applyDevicePreferences();
}


applyDevicePreferences();


function updateDeveloperUI(
    profile
) {

    const isDeveloper =
        profile?.role === "developer" &&
        window.HCFirebaseData?.isDeveloper?.() === true;

    developerSettingsSection?.classList.toggle(
        "hidden",
        !isDeveloper
    );

    settingsDeveloperBadge?.classList.toggle(
        "hidden",
        !isDeveloper
    );

    if (sidebarUserName) {
        sidebarUserName.textContent =
            profile?.username ||
            profile?.realName ||
            "You";
    }

    if (sidebarUserRole) {
        sidebarUserRole.textContent =
            isDeveloper
                ? "Developer"
                : "Student";
    }

    if (sidebarUserAvatar) {
        const avatarSource =
            profile?.username ||
            profile?.realName ||
            "Y";

        sidebarUserAvatar.textContent =
            Array.from(avatarSource.trim())[0]?.toUpperCase() ||
            "Y";
    }
}


/* =========================================================
   SETTINGS
========================================================= */

function openSettingsModal() {

    if (!settingsModal) {
        return;
    }

    settingsModal.classList.remove(
        "hidden"
    );
}


function closeSettings() {

    if (!settingsModal) {
        return;
    }

    settingsModal.classList.add(
        "hidden"
    );
}


async function refreshSharedData() {

    try {
        await Promise.all([
            refreshFirestoreCommunityState(),
            refreshFirestorePosts()
        ]);

        closeSettings();

    } catch (error) {
        console.error(
            "Could not refresh shared data:",
            error
        );

        window.alert(
            error?.message ||
            "Could not refresh shared data."
        );
    }
}


/* =========================================================
   MAIN NAV EVENTS
========================================================= */

sidebarLinks.forEach(
    link => {

        link.addEventListener(
            "click",
            () => {

                showAppPage(
                    link.dataset.page
                );
            }
        );
    }
);


sidebarSecondaryPageLinks.forEach(
    link => {

        link.addEventListener(
            "click",
            () => {

                showAppPage(
                    link.dataset.page
                );
            }
        );
    }
);


if (homeButton) {

    homeButton.addEventListener(
        "click",
        () => {

            activeCommunityId =
                null;

            renderJoinedCommunities();

            showAppPage(
                "home"
            );
        }
    );
}


if (discoverButton) {

    discoverButton.addEventListener(
        "click",
        () => {

            activeCommunityId =
                null;

            renderJoinedCommunities();

            showAppPage(
                "discover"
            );
        }
    );
}


/* =========================================================
   DISCOVER EVENTS
========================================================= */

if (communitySearch) {

    communitySearch.addEventListener(
        "input",
        renderCommunities
    );
}


categoryFilters.forEach(
    filter => {

        filter.addEventListener(
            "click",
            () => {

                activeCategory =
                    filter.dataset.category;


                categoryFilters.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );
                    }
                );


                filter.classList.add(
                    "active"
                );


                renderCommunities();
            }
        );
    }
);


/* =========================================================
   COMMUNITY BUTTON EVENTS
========================================================= */

if (publishPostButton) {

    publishPostButton.addEventListener(
        "click",
        publishPost
    );
}


if (postInput) {

    postInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                (event.ctrlKey ||
                    event.metaKey)
            ) {

                event.preventDefault();

                publishPost();
            }
        }
    );
}


if (communityEventsButton) {

    communityEventsButton.addEventListener(
        "click",
        openCommunityEvents
    );
}


if (communityAboutButton) {

    communityAboutButton.addEventListener(
        "click",
        openCommunityAbout
    );
}


if (leaveCommunityButton) {

    leaveCommunityButton.addEventListener(
        "click",
        leaveActiveCommunity
    );
}


/* =========================================================
   CREATE COMMUNITY EVENTS
========================================================= */

if (createCommunityButton) {

    createCommunityButton.addEventListener(
        "click",
        openCreateCommunityModal
    );
}


if (createCommunityHeaderButton) {

    createCommunityHeaderButton.addEventListener(
        "click",
        openCreateCommunityModal
    );
}


if (closeCreateCommunityModal) {

    closeCreateCommunityModal.addEventListener(
        "click",
        closeCommunityModal
    );
}


if (createCommunityForm) {

    createCommunityForm.addEventListener(
        "submit",
        createCommunity
    );
}


if (createCommunityModal) {

    createCommunityModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                createCommunityModal
            ) {

                closeCommunityModal();
            }
        }
    );
}


/* =========================================================
   SETTINGS EVENTS
========================================================= */

if (settingsButton) {

    settingsButton.addEventListener(
        "click",
        openSettingsModal
    );
}


if (closeSettingsModal) {

    closeSettingsModal.addEventListener(
        "click",
        closeSettings
    );
}


if (refreshSharedDataButton) {

    refreshSharedDataButton.addEventListener(
        "click",
        refreshSharedData
    );
}


if (appearanceMode) {

    appearanceMode.addEventListener(
        "change",
        event => {
            updateDevicePreference(
                "theme",
                event.target.value
            );
        }
    );
}


if (compactModeToggle) {

    compactModeToggle.addEventListener(
        "change",
        event => {
            updateDevicePreference(
                "compact",
                event.target.checked
            );
        }
    );
}


if (notificationBadgeToggle) {

    notificationBadgeToggle.addEventListener(
        "change",
        event => {
            updateDevicePreference(
                "notificationBadges",
                event.target.checked
            );
        }
    );
}


if (resetPreferencesButton) {

    resetPreferencesButton.addEventListener(
        "click",
        resetDevicePreferences
    );
}


if (settingsModal) {

    settingsModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                settingsModal
            ) {

                closeSettings();
            }
        }
    );
}


/* =========================================================
   ESCAPE CLOSES MODALS
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape"
        ) {
            return;
        }

        closeCommunityModal();
        closeSettings();
    }
);


/* =========================================================
   FIRESTORE COMMUNITY SYNC
========================================================= */

async function refreshFirestoreCommunityState() {

    if (!window.HCFirebaseData) {
        throw new Error(
            "Firebase data service is not ready."
        );
    }

    const state =
        await window.HCFirebaseData.getCommunityState(
            defaultCommunities
        );

    communities =
        state.communities;

    joinedCommunities =
        state.joinedCommunities;

    renderAllAppContent();
}


/* =========================================================
   FIRESTORE POST SYNC
========================================================= */

async function refreshFirestorePosts() {

    if (!window.HCFirebaseData) {
        throw new Error(
            "Firebase data service is not ready."
        );
    }

    posts =
        await window.HCFirebaseData.getPostState();

    renderHome();
    renderCommunityPosts();
}


/* =========================================================
   AUTHENTICATED APP TRANSITION
========================================================= */

const learnMoreBtn =
    document.querySelector(
        ".learn-more-btn"
    );


async function handleAuthenticatedEntry(event) {

    updateDeveloperUI(
        event?.detail?.profile ||
        window.HCFirebaseData?.getCurrentProfile?.()
    );

    if (
        !welcomeExperience ||
        !mainApp
    ) {
        return;
    }

    const entryStatus = document.getElementById("entryStatus");
    const entryMessage = document.getElementById("entryMessage");
    const retryEntryButton = document.getElementById("retryEntryButton");
    entryStatus?.classList.remove("hidden");
    if (entryMessage) entryMessage.textContent = "Loading your communities and posts…";
    if (retryEntryButton) retryEntryButton.disabled = true;

    try {
        await Promise.all([
            refreshFirestoreCommunityState(),
            refreshFirestorePosts()
        ]);
    } catch (error) {
        event?.detail?.onFailure?.();
        if (entryMessage) entryMessage.textContent = error?.code === "permission-denied"
            ? "Your community data could not be opened. Try again or contact the site administrator."
            : "Your community data could not be loaded. Check your connection and try again.";
        if (retryEntryButton) retryEntryButton.disabled = false;
        console.error(
            "Could not load Firestore community data:",
            error
        );

        return;
    }
    entryStatus?.classList.add("hidden");

    welcomeExperience.style.transition =
        `
        opacity 0.55s ease,
        transform 0.55s ease
        `;

    welcomeExperience.style.opacity =
        "0";

    welcomeExperience.style.transform =
        "scale(0.985)";


    if (welcomeNav) {
        welcomeNav.style.opacity =
            "0";
    }


    setTimeout(
        () => {

            welcomeExperience.classList.add(
                "hidden"
            );


            if (welcomeNav) {

                welcomeNav.classList.add(
                    "hidden"
                );
            }


            mainApp.classList.remove(
                "hidden"
            );


            window.scrollTo(
                0,
                0
            );


            window.requestAnimationFrame(
                () => {

                    mainApp.classList.add(
                        "show"
                    );
                }
            );


            activeCommunityId =
                null;


            showAppPage(
                "home"
            );

        },
        550
    );
}


window.addEventListener(
    "hc-authenticated",
    handleAuthenticatedEntry
);


if (learnMoreBtn) {

    learnMoreBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "about.html";
        }
    );
}


/* =========================================================
   RENDER EVERYTHING
========================================================= */

function renderAllAppContent() {

    renderJoinedCommunities();
    renderCommunities();
    renderHome();
    renderGlobalEvents();
    renderNotifications();
    renderMentions();
}


/* =========================================================
   INITIALIZE
========================================================= */

window.addEventListener(
    "DOMContentLoaded",
    () => {

        renderAllAppContent();

        updateWelcomeAnimations();
    }
);

// Retry the authenticated entry without requiring a reload or another sign-in.
document.getElementById("retryEntryButton")?.addEventListener("click", () => {
    window.dispatchEvent(new Event("hc-retry-entry"));
});
