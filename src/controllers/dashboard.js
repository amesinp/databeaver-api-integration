const axios = require('axios').default;
const NodeCache = require('node-cache');
const databeaver = require('databeaver-js');

const cache = new NodeCache();
const client = new databeaver.Client(
  process.env.API_KEY,
  process.env.NODE_ENV === 'production' ? 
    databeaver.Environment.Production :
    databeaver.Environment.Sandbox
);

exports.showDashboard = async function (req, res, next) {
  try {
    const page = req.query.page ? parseInt(req.query.page) || 1 : 1;  
    const limit = req.query.limit ? parseInt(req.query.limit) || 20 : 20;

    // Cache Form Id
    let formId = cache.get('formid');
    if (!formId) {
      const form = await client.getFormByName(process.env.API_FORM);
      if (!form) {
        throw new Error(`Form ${process.env.API_FORM} not found`);
      }

      formId = form.id;
      cache.set('formid', formId);
    }
    
    const entryResult = await client.getEntries({
      filter: {
        form: formId
      },
      page: page,
      perPage: limit
    });

    res.render('dashboard', {
      total: entryResult.total,
      entries: entryResult.data,
      pageCount: entryResult.pageCount
    });
  } catch (error) {
    console.error(error);
    res.render('dashboard', {
      error: error.message
    });
  }
};
