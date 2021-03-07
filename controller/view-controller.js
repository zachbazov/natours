// exports.get = (req, res) => {
//     // In order to now pass data into this template,
//     // all we need to do is to define an object in render().
//     res.status(200).render('base', {
//         // These passed variables called locals in the pug template.
//         tour: 'The Forest Hiker',
//         user: 'Zach'
//     });
// };

exports.getOverview = (req, res) => {
    res.status(200).render('overview', {
        title: 'All tours'
    });
};


exports.getTour = (req, res) => {
    res.status(200).render('tour', {
        title: 'The Forest Hiker'
    });
};