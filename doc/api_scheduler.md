The problem is that the newsapi free key only allows 1000 request/day, and 250 requests/hr

That comes to one request every 86 seconds.

* ApiCounter Model
    date
    counter

* SourceRetrieval Model
    id
    date
    totalArticles
    totalPages
    pagesRetrieved



For each source
    get the request counter for today from the database
    if it isn't there, create it

    if we already gotten page 1 from this source
        get the next page
    else
        query for todays results and get the total number
        calculate the number of pages to retrieve
            total / 100 rounded down to nearest whole number because we already got the first page

    increment request counter for today

    if request counter for today <1000
        schedule the next run of this function in 90 seconds.
    else
        schedule the next run of this function for tomorrow at 00:00
