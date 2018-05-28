module.exports = [
    {
        name: "Washington Examiner",
        seedUrl: 'https://www.washingtonexaminer.com',
        selector: '.Page-navigation .NavigationLink',
        include: ['/news','/politics','/policy'],
        relativeLinks: false
    },
    {
        name: "USA Today",
        seedUrl: 'https://www.usatoday.com',
        selector: '.site-nav-link',
        include: ['/news','/money','/tech','/policing','/washington'],
        relativeLinks: true
    },
    {
        name: "Los Angeles Times",
        seedUrl: 'https://www.latimes.com',
        selector: '.topics-list-item a',
        include: ['/local', '/politics', '/business', '/world'],
        relativeLinks: false
    }
]