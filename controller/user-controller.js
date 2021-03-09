const User = require('../model/user-model');
const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');
const controller = require('./generic-controller');
const multer = require('multer');

// File Uploading - multer.
// The idea is to store the links for the images on our database,
// not to upload them directly.
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/users');
    },
    filename: (req, file, cb) => {
        // ext - File's storage, how to store the files, with the destination and file name.
        // Out of the req.body, splitting the mimetype property e,g, 'image/jpeg'.
        const ext = file.mimetype.split('/')[1];
        cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
    }
});

// Tests if the uploaded file is an image,
// is so, we pass true to the cb fn, if not, we pass false along with a an error.
// Doesn't upload files that are not images.
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image, please select a valid image file.', 400), false);
    }
};

// dest - A destination for files to be upload.
// In cases no options passes, the storing will be on memory.
//const upload = multer({ dest: 'public/img/users' });
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

// photo - Field name of the model.
exports.uploadUserPhoto = upload.single('photo');

exports.getAllUsers = controller.getAll(User);

exports.getUser = controller.getOne(User);

exports.updateUser = controller.updateOne(User);

exports.deleteUser = controller.deleteOne(User);

exports.deactivate = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getUserProfile = (req, res, next) => {
    // Instead of getting the id from the query parameters,
    // get it from the current user document.
    req.params.id = req.user.id;
    next();
}

// Loop through all the fields that are in the object,
// and then for each field we check if it's one of the allowed fields,
// and if it is, then we create a new field in the new object,
// with the same name, with the exact same value as it has in the original object.
// returns the new object.
const filterObject = (object, ...allowedFields) => {
    const newObject = {};
    Object.keys(object).forEach(el => {
        if (allowedFields.includes(el)) newObject[el] = object[el];
    });
    return newObject;
}

exports.updateUserProfile = catchAsync(async (req, res, next) => {
    //console.log(req.file, req.body);
    if (req.body.password || req.body.passwordConfirm)
        return next(
            new AppError('This route is not for password update, please use /update-password.', 400));
            
    // filteredBody - filtered out unwanted field name that are not specified to be updated.
    const filteredBody = filterObject(req.body, 'name', 'email');
    // Updates upload - Adds the photo property to the filter.
    if (req.file) filteredBody.photo = req.file.filename;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        // new - returns the new object, the updated object, instead of the old object.
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        user: updatedUser
    });
});

// Removed - Implemented a generic controller.

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//     const users = await User.find().select('-__v');

//     res.status(200).json({
//         status: 'success',
//         results: users.length,
//         data: users
//     });
// });