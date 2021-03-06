var auth = require('../lib/auth'),
    janitor = require('../lib/janitor'),
    sites = require('../lib/sites'),
    users = require('../lib/users'),
    _s = require('underscore.string');

module.exports = {
    init: function(app) {
        app.get('/tracking', auth.authenticated, module.exports.showSites);
        app.get('/tracking/new', auth.authenticated, module.exports.newSite);

        app.post('/tracking', auth.authenticated, module.exports.createSite);

        app.post('/tracking/:site_id/add-start', auth.authenticated, module.exports.addStart);
        app.post('/tracking/:site_id/add-end', auth.authenticated, module.exports.addEnd);
        app.post('/tracking/:site_id/delete-start', auth.authenticated, module.exports.deleteStart);
        app.post('/tracking/:site_id/delete-end', auth.authenticated, module.exports.deleteEnd);

        app.post('/tracking/:site_id/disable', auth.authenticated, module.exports.disable);
        app.post('/tracking/:site_id/enable', auth.authenticated, module.exports.enable);
        app.post('/tracking/:site_id/remove', auth.authenticated, module.exports.remove);
    },
    // Show the list of sites for the logged in user, or *all* sites if admin.
    showSites: function(req, res) {
        var search = _s.trim(req.query.q);

        sites.list({
            isAdmin: req.user.admin,
            user_id: req.user._id,
            search: search
        }, function(err, result) {
            res.render('sites', {
                search: search,
                sites: result.items,
                title: 'Tracking',
                total: result.total
            });
        });
    },
    // Show the page with form to add a new site.
    newSite: function(req, res) {
        users.list(function(err, users) {
            if (err) {
                return janitor.error(res, err);
            }
            res.render('newsite', {
                title: 'Track New Document',
                users: users
            });
        });
    },
    // Create a site
    createSite: function(req, res) {
        var errors,
            options;

        options = {
            search_dates: null,
            title: req.body.title,
            type: req.body.type,
            url: req.body.url || null,
            user_id: req.user._id
        };

        req.assert('type', 'Type must be valid.').isIn([
            "Pre-Budget Statement",
            "Executive's Budget Proposal",
            "Enacted Budget",
            "Citizens Budget",
            "In-Year Report",
            "Mid-Year Review",
            "Year-End Report",
            "Audit Report"
        ]);
        req.assert('title', 'Title can\'t be empty').notEmpty();

        errors = req.validationErrors();

        if (errors && errors.length) {
            return janitor.invalid(res, errors);
        }

        sites.insert(options, function(err) {
            if (err) {
                return janitor.error(res, err);
            }

            res.redirect('/tracking');
        })
    },
    // enable a site; depends on created_at matching
    enable: function(req, res) {
        sites.enable({
            site_id: req.params.site_id
        }, function(err) {
            if (err) {
                return janitor.error(res, err);
            }

            res.redirect('/tracking#site-' + req.body.index);
        });
    },
    // disable a site; depends on created_at matching
    disable: function(req, res) {
        sites.disable({
            site_id: req.params.site_id
        }, function(err) {
            if (err) {
                return janitor.error(res, err);
            }

            res.redirect('/tracking#site-' + req.body.index);
        });
    },
    // remove a site; depends on created_at matching
    remove: function(req, res) {
        sites.remove({
            site_id: req.params.site_id
        }, function(err) {
            if (err) {
                return janitor.error(res, err);
            }

            res.redirect('/tracking');
        });
    },
    // add a date to a site; depends on created_at matching
    addStart: function(req, res) {
        sites.addStart({
            date: req.body.date,
            site_id: req.params.site_id
        }, function(err) {
            if (err) {
                return janitor.error(res, err);
            }

            res.redirect('/tracking#site-' + req.body.index);
        });
    },
    addEnd: function(req, res) {
        sites.addEnd({
            date: req.body.date,
            site_id: req.params.site_id
        }, function(err) {
            if (err) {
                return janitor.error(res, err);
            }

            res.redirect('/tracking#site-' + req.body.index);
        });
    },
    // delete a date from a site; depends on created_at matching
    deleteStart: function(req, res) {
        sites.deleteStart({
            site_id: req.params.site_id
        }, function(err) {
            if (err) {
                return janitor.error(res, err);
            }

            res.redirect('/tracking#site-' + req.body.index);
        });
    },
    deleteEnd: function(req, res) {
        sites.deleteEnd({
            site_id: req.params.site_id
        }, function(err) {
            if (err) {
                return janitor.error(res, err);
            }

            res.redirect('/tracking#site-' + req.body.index);
        });
    }
};
