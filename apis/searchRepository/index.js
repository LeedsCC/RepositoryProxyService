const RepositoryService = require('../../lib/services/repositoryRestService');
const crypto = require('crypto')

module.exports = async function searchRepository(args, finished) {
    try {
        const queryCache = this.db.use("Query")

        let { query } = args.req

        const currentPage = Number(query.page)

        const queryHash = crypto.createHash('md5').update(JSON.stringify({ q: query.q, tags: query.tags, page: currentPage })).digest("hex")

        if (queryCache.$(queryHash).exists) {
            return finished({ results: queryCache.$(queryHash).getDocument(true) })
        }

        query.meta = {}

        if (currentPage > 1) {
            const previousQueryHash = crypto.createHash('md5').update(JSON.stringify({ q: query.q, tags: query.tags, page: (currentPage - 1) })).digest("hex")
        
            if (queryCache.$(previousQueryHash).exists) {
                const previousQuery = queryCache.$(previousQueryHash).getDocument(true)
            
                query.meta = {
                    servicePage: previousQuery.servicePage,
                    resourcePage: previousQuery.resourcePage,
                    serviceIndex: previousQuery.serviceIndex,
                    resourceIndex: previousQuery.resourceIndex
                }
            }
        }

        const repositoryService = new RepositoryService(this.userDefined.serviceConfig);

        const results = await repositoryService.search(query)

        queryCache.$(queryHash).setDocument(results)

        finished({
            results
        })
    } catch(error) {
        finished({ error })
    }
}