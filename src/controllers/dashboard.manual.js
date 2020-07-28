/* 
 Shows how to integrate by calling the API endpoints manually
*/

const axios = require('axios').default;
const NodeCache = require('node-cache');

const cache = new NodeCache();

exports.showDashboard = async function (req, res, next) {
  try {
    const page = req.query.page ? parseInt(req.query.page) || 1 : 1;  
    const limit = req.query.limit ? parseInt(req.query.limit) || 20 : 20;

    // Cache Form Id
    let formId = cache.get('formid');
    if (!formId) {
      formId = await getFormId();
      cache.set('formid', formId);
    }
    
    const entryResult = await getPaginatedEntries(formId, page, limit);

    res.render('dashboard', {
      total: entryResult._metadata.total,
      entries: entryResult.data,
      pageCount: entryResult._metadata.pageCount
    });
  } catch (error) {
    console.error(error);
    res.render('dashboard', {
      error: error.message
    });
  }
};

async function getFormId() {
  const params = new URLSearchParams();
  params.set('name', process.env.API_FORM);
  params.set('perPage', 1);

  const url = `${process.env.API_URL}/v1/forms?${params.toString()}`;
  const response = await axios.get(url, {
    headers: {
      'Authorization': `Bearer ${process.env.API_KEY}`
    }
  });
  const result = response.data;

  if (!result.success || result.data.length == 0) {
    throw new Error(`Form ${process.env.API_FORM} not found`);
  }

  return result.data[0].id;
}

async function getPaginatedEntries(formId, page, limit) {
  const params = new URLSearchParams();
  params.set('form', formId);
  params.set('page', page);
  params.set('perPage', limit);

  const url = `${process.env.API_URL}/v1/entries?${params.toString()}`;
  const response = await axios.get(url, {
    headers: {
      'Authorization': `Bearer ${process.env.API_KEY}`
    }
  });
  const result = response.data;

  if (!result.success) {
    return [];
  }

  return result;
}
