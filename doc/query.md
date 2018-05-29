newsapi query object


{
  q: 'bitcoin',
  sources: 'bbc-news,the-verge',
  domains: 'bbc.co.uk, techcrunch.com',
  from: '2017-12-01',
  to: '2017-12-12',
  language: 'en',
  sortBy: 'publishedAt',
  page: 2,
  pageSize: 100
}

q
    Keywords or phrases to search for.

    Advanced search is supported here:

    Surround phrases with quotes (") for exact match.
    Prepend words or phrases that must appear with a + symbol. Eg: +bitcoin
    Prepend words that must not appear with a - symbol. Eg: -bitcoin
    Alternatively you can use the AND / OR / NOT keywords, and optionally group these with parenthesis. Eg: crypto AND (ethereum OR litecoin) NOT bitcoin.
    The complete value for q must be URL-encoded.

sources
    A comma-seperated string of identifiers (maximum 20) for the news sources or blogs you want headlines from. Use the /sources endpoint to locate these programmatically or look at the sources index.

domains
    A comma-seperated string of domains (eg bbc.co.uk, techcrunch.com, engadget.com) to restrict the search to.

from
    A date and optional time for the oldest article allowed. This should be in ISO 8601 format (e.g. 2018-05-29 or 2018-05-29T11:58:22) Default: the oldest according to your plan.

to
    A date and optional time for the newest article allowed. This should be in ISO 8601 format (e.g. 2018-05-29 or 2018-05-29T11:58:22) Default: the newest according to your plan.

language
    The 2-letter ISO-639-1 code of the language you want to get headlines for. Possible options: ar de en es fr he it nl no pt ru se ud zh . Default: all languages returned.

sortBy
    The order to sort the articles in. Possible options: relevancy, popularity, publishedAt.
    relevancy = articles more closely related to q come first.
    popularity = articles from popular sources and publishers come first.
    publishedAt = newest articles come first.
    Default: publishedAt

pageSize
    int
    The number of results to return per page. 20 is the default, 100 is the maximum.

page
    int
    Use this to page through the results.

apiKey
    REQUIRED
    Your API key. Alternatively you can provide this via the X-Api-Key HTTP header.








Response object
    status
        string
        If the request was successful or not. Options: ok, error. In the case of error a code and message property will be populated.

    totalResults
        int
        The total number of results available for your request. Only a limited number are shown at a time though, so use the page parameter in your requests to page through them.

    articles
        array[article]
        The results of the request.

    source
        object
        The identifier id and a display name name for the source this article came from.

    author
        string
        The author of the article

    title
        string
        The headline or title of the article.

    description
        string
        A description or snippet from the article.

    url
        string
        The direct URL to the article.

    urlToImage
        string
        The URL to a relevant image for the article.

    publishedAt
        string
        The date and time that the article was published, in UTC (+000)

