const request = require('request');

function parseJsonFormatter(result) {
  let jsonResult;

  try {
    jsonResult = JSON.parse(result);
  } catch (err) {
    jsonResult = {};
  }

  return jsonResult;
}

function requestAsync(args, { formatter } = {}) {
    return new Promise((resolve, reject) => {
      request(args, (err, response, body) => {
  
        if (err) return reject(err);
  
        if (response.statusCode !== 200 && response.statusCode !== 201) {
          return reject(body);
        }
    
        if (formatter) {
          return resolve(formatter(body));
        }
  
        return resolve(body);
      });
    });
  }

class RepositoryRestService {
    constructor(configuration) {
        this.configuration = configuration;
    }

    async searchServices(query) {
        const args = this.buildRequest("serviceSearch", query);

        const result = await requestAsync(args);

        return (result && parseJsonFormatter(result)) || {};
      }

    /**
     * @param {string} servicePoint the configuration service point
     * 
     * @returns {Object} requestArguments
     */
    buildRequest(servicePoint, query) {
        const { configuration } = this;

        const servicePointConfiguration = configuration.api.servicePoints[servicePoint];

        if (!servicePointConfiguration) {
            throw Error(`Configuration for service point ${servicePoint} not found`);
        }

        let requestArguments = {
            url: `${configuration.api.host}/${servicePointConfiguration.endpoint}`,
            ...servicePointConfiguration.arguments
        };

        if (query) {
            requestArguments.qs = query
        }

        return requestArguments;
    }
}

module.exports = RepositoryRestService