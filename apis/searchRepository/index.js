const RepositoryService = require('../../lib/services/repositoryRestService');

module.exports = async function searchRepository(args, finished) {
    console.log("repository up")

    console.log(args)

    try {
        console.log(this)

        const repositoryService = new RepositoryService(this.userDefined.serviceConfig);

        const result = await repositoryService.searchServices(args.query)
    
        finished({
            responseFrom: 'repository_service',
            api: 'searchRepository',
            use: 'results',
            results: result.data
        })
    } catch(error) {
        console.log(error)

        finished({ error })
    }
}